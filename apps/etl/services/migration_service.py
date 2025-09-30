# ================================
# apps/etl/services/migration_service.py
# ================================

import time
import logging
from django.db import connection, transaction
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import StringIO
import csv
from apps.etl.models import (
    VendorData, VQCData, FTData, ChargingStationData,
    MigrationHistory, DuplicateSerialsLog
)
from apps.etl.utils.validators import DataValidator
from apps.etl.utils.google_sheets import GoogleSheetsExtractor

logger = logging.getLogger(__name__)

class MigrationService:
    """Handles data migration from Google Sheets to PostgreSQL"""
    
    def __init__(self, user, service_account_file):
        self.user = user
        self.service_account_file = service_account_file
        self.extractor = GoogleSheetsExtractor(service_account_file)
        self.validator = DataValidator()
    
    def start_migration(self, sheet_configs, mode='FAST'):
        """
        Start migration process
        sheet_configs: List of dicts with {spreadsheet_id, range, table_name, vendor}
        mode: 'FAST' or 'SLOW'
        """
        self.extractor.connect()
        
        migration_records = []
        
        if mode == 'FAST':
            # Parallel processing for fast mode
            with ThreadPoolExecutor(max_workers=len(sheet_configs)) as executor:
                futures = {
                    executor.submit(
                        self._migrate_sheet_fast,
                        config
                    ): config for config in sheet_configs
                }
                
                for future in as_completed(futures):
                    config = futures[future]
                    try:
                        migration_record = future.result()
                        migration_records.append(migration_record)
                    except Exception as e:
                        logger.error(f"✗ Migration failed for {config['range']}: {e}")
        else:
            # Sequential processing for slow mode
            for config in sheet_configs:
                try:
                    migration_record = self._migrate_sheet_slow(config)
                    migration_records.append(migration_record)
                except Exception as e:
                    logger.error(f"✗ Migration failed for {config['range']}: {e}")
        
        return migration_records
    
    def _migrate_sheet_fast(self, config):
        """Fast migration: Load all → Transform → Bulk insert"""
        start_time = time.time()
        
        # Create migration history record
        migration = MigrationHistory.objects.create(
            sheet_name=config['range'],
            table_name=config['table_name'],
            status='RUNNING',
            migration_mode='FAST',
            done_by=self.user
        )
        
        try:
            logger.info(f"🚀 [FAST] Starting migration: {config['range']} → {config['table_name']}")
            
            # Step 1: Extract data
            logger.info(f"📥 Loading data from {config['range']}...")
            raw_data = self.extractor.extract_sheet_data(
                config['spreadsheet_id'],
                config['range']
            )
            
            if not raw_data or len(raw_data) < 2:
                raise ValueError("No data found in sheet")
            
            headers = raw_data[0]
            rows = raw_data[1:]
            logger.info(f"✓ Loaded {len(rows)} rows")
            
            # Step 2: Transform data
            logger.info(f"🔄 Transforming {len(rows)} records...")
            transformed_data = self._transform_data(
                headers, rows, config['table_name'], config.get('vendor')
            )
            logger.info(f"✓ Transformed {len(transformed_data)} records")
            
            # Step 3: Detect duplicates
            logger.info(f"🔍 Checking for duplicates...")
            clean_data, duplicates = self._detect_duplicates(
                transformed_data, config['table_name'], migration
            )
            if duplicates:
                logger.warning(f"⚠ Found {len(duplicates)} duplicates (skipped)")
            
            # Step 4: Bulk insert using COPY
            logger.info(f"💾 Bulk inserting {len(clean_data)} records...")
            self._bulk_insert_copy(clean_data, config['table_name'])
            
            duration = time.time() - start_time
            migration.records_count = len(clean_data)
            migration.duration_seconds = duration
            migration.status = 'COMPLETED'
            migration.save()
            
            logger.info(f"✅ [FAST] Completed in {duration:.2f}s: {config['range']} ({len(clean_data)} records)")
            
            return migration
            
        except Exception as e:
            duration = time.time() - start_time
            migration.status = 'FAILED'
            migration.error_message = str(e)
            migration.duration_seconds = duration
            migration.save()
            logger.error(f"❌ [FAST] Failed: {config['range']} - {e}")
            raise
    
    def _migrate_sheet_slow(self, config):
        """Slow migration: Load in chunks → Transform → Insert one-by-one"""
        start_time = time.time()
        
        migration = MigrationHistory.objects.create(
            sheet_name=config['range'],
            table_name=config['table_name'],
            status='RUNNING',
            migration_mode='SLOW',
            done_by=self.user
        )
        
        try:
            logger.info(f"🐌 [SLOW] Starting migration: {config['range']} → {config['table_name']}")
            
            # Extract data
            logger.info(f"📥 Loading data from {config['range']}...")
            raw_data = self.extractor.extract_sheet_data(
                config['spreadsheet_id'],
                config['range']
            )
            
            if not raw_data or len(raw_data) < 2:
                raise ValueError("No data found in sheet")
            
            headers = raw_data[0]
            rows = raw_data[1:]
            total_rows = len(rows)
            logger.info(f"✓ Loaded {total_rows} rows")
            
            # Process in batches
            BATCH_SIZE = 100
            inserted_count = 0
            duplicate_count = 0
            
            for i in range(0, total_rows, BATCH_SIZE):
                batch = rows[i:i + BATCH_SIZE]
                
                # Transform batch
                transformed_batch = self._transform_data(
                    headers, batch, config['table_name'], config.get('vendor')
                )
                
                # Insert one by one
                for record in transformed_batch:
                    try:
                        # Check duplicate
                        if self._is_duplicate(record, config['table_name']):
                            duplicate_count += 1
                            DuplicateSerialsLog.objects.create(
                                uid=record.get('uid', ''),
                                table_name=config['table_name'],
                                migration_history=migration
                            )
                            continue
                        
                        # Insert record
                        self._insert_single_record(record, config['table_name'])
                        inserted_count += 1
                        
                    except Exception as e:
                        logger.error(f"Failed to insert record: {e}")
                        continue
                
                # Periodic logging
                if (i + BATCH_SIZE) % 500 == 0 or (i + BATCH_SIZE) >= total_rows:
                    progress = min(i + BATCH_SIZE, total_rows)
                    percent = (progress / total_rows) * 100
                    logger.info(f"⏳ Progress: {progress}/{total_rows} ({percent:.1f}%) - Inserted: {inserted_count}, Duplicates: {duplicate_count}")
            
            duration = time.time() - start_time
            migration.records_count = inserted_count
            migration.duration_seconds = duration
            migration.status = 'COMPLETED'
            migration.save()
            
            logger.info(f"✅ [SLOW] Completed in {duration:.2f}s: {config['range']} ({inserted_count} records, {duplicate_count} duplicates)")
            
            return migration
            
        except Exception as e:
            duration = time.time() - start_time
            migration.status = 'FAILED'
            migration.error_message = str(e)
            migration.duration_seconds = duration
            migration.save()
            logger.error(f"❌ [SLOW] Failed: {config['range']} - {e}")
            raise
    
    def _transform_data(self, headers, rows, table_name, vendor=None):
        """Transform raw data to model format"""
        transformed = []
        
        for row in rows:
            if len(row) == 0:
                continue
            
            # Create dict from headers and row
            record = {}
            for i, header in enumerate(headers):
                value = row[i] if i < len(row) else ''
                record[header.strip().lower().replace(' ', '_')] = value
            
            # Transform based on table
            if table_name == 'vendor_data':
                transformed_record = self._transform_vendor_data(record, vendor)
            elif table_name == 'vqc_data':
                transformed_record = self._transform_vqc_data(record, vendor)
            elif table_name == 'ft_data':
                transformed_record = self._transform_ft_data(record)
            elif table_name == 'charging_station_data':
                transformed_record = self._transform_charging_station_data(record)
            else:
                continue
            
            if transformed_record:
                transformed.append(transformed_record)
        
        return transformed
    
    def _transform_vendor_data(self, record, vendor):
        """Transform vendor data"""
        uid = record.get('uid', '')
        
        # Validate serial number
        if not self.validator.validate_serial_number(uid):
            logger.warning(f"Invalid serial format: {uid}")
            return None
        
        return {
            'date': self.validator.parse_date(record.get('date')),
            'mo_number': self.validator.normalize_text(record.get('mo_number', '')),
            'uid': self.validator.normalize_text(uid),
            'ring_status': self.validator.normalize_status(record.get('ring_status', '')),
            'charger_status': self.validator.normalize_status(record.get('charger_status', '')),
            'charger_lot_details': self.validator.normalize_text(record.get('charger_lot_details', '')),
            'rejection_reason': self.validator.normalize_text(record.get('rejection_reason', '')),
            'vendor': vendor
        }
    
    def _transform_vqc_data(self, record, vendor):
        """Transform VQC data"""
        uid = record.get('uid', '')
        
        if not self.validator.validate_serial_number(uid):
            logger.warning(f"Invalid serial format: {uid}")
            return None
        
        return {
            'logged_timestamp': self.validator.parse_date(record.get('logged_timestamp', '')),
            'three_de_mo': self.validator.normalize_text(record.get('3de_mo', '')),
            'uid': self.validator.normalize_text(uid),
            'sku': self.validator.normalize_text(record.get('sku', '')),
            'size': self.validator.normalize_text(record.get('size', '')),
            'ihc_mo': self.validator.normalize_text(record.get('ihc_mo', '')),
            'ihc': self.validator.normalize_text(record.get('ihc', '')),
            'makenica': self.validator.normalize_text(record.get('makenica', '')),
            'vendor': vendor,
            'status': self.validator.normalize_status(record.get('status', '')),
            'reason': self.validator.normalize_text(record.get('reason', '')),
            'pcb_type': self.validator.normalize_text(record.get('pcb', '')),
            'qc_person_id': self.validator.normalize_text(record.get('qc_code', '')),
        }
    
    def _transform_ft_data(self, record):
        """Transform FT data"""
        uid = record.get('uid', '')
        
        if not self.validator.validate_serial_number(uid):
            return None
        
        return {
            'date': self.validator.parse_date(record.get('date', '')),
            'month': self.validator.normalize_text(record.get('month', '')),
            'mo_number': self.validator.normalize_text(record.get('mo_number', '')),
            'uid': self.validator.normalize_text(uid),
            'status': self.validator.normalize_status(record.get('status', '')),
            'reason': self.validator.normalize_text(record.get('reason', '')),
            'size': self.validator.normalize_text(record.get('size', '')),
            'sku': self.validator.normalize_text(record.get('sku', '')),
            'shift': self.validator.normalize_text(record.get('shift', '')),
            'na_status': self.validator.normalize_text(record.get('na_status', '')),
            'pcb': self.validator.normalize_text(record.get('pcb', '')),
            'qc_code': self.validator.normalize_text(record.get('qc_code', '')),
            'qc_person': self.validator.normalize_text(record.get('qc_person', '')),
            'remarks': self.validator.normalize_text(record.get('remarks', '')),
        }
    
    def _transform_charging_station_data(self, record):
        """Transform charging station data"""
        uid = record.get('uid', '')
        
        if not self.validator.validate_serial_number(uid):
            return None
        
        return {
            'logged_timestamp': self.validator.parse_date(record.get('logged_timestamp', '')),
            'uid': self.validator.normalize_text(uid),
            'serial_number': self.validator.normalize_text(record.get('serial_number', '')),
            'status': self.validator.normalize_status(record.get('status', '')),
            'reason': self.validator.normalize_text(record.get('reason', '')),
            'mac_id': self.validator.normalize_text(record.get('mac_id', '')),
            'polishing_qc_status': self.validator.normalize_status(record.get('polishing_qc_status', '')),
            'after_moulding_status': self.validator.normalize_status(record.get('after_moulding_status', '')),
            'ioc_status': self.validator.normalize_status(record.get('ioc_status', '')),
        }
    
    def _detect_duplicates(self, data, table_name, migration):
        """Detect duplicate serial numbers"""
        clean_data = []
        duplicates = []
        
        seen_uids = set()
        
        # Check against existing database records
        existing_uids = set()
        if table_name == 'vendor_data':
            existing_uids = set(VendorData.objects.values_list('uid', flat=True))
        elif table_name == 'vqc_data':
            existing_uids = set(VQCData.objects.values_list('uid', flat=True))
        elif table_name == 'ft_data':
            existing_uids = set(FTData.objects.values_list('uid', flat=True))
        elif table_name == 'charging_station_data':
            existing_uids = set(ChargingStationData.objects.values_list('uid', flat=True))
        
        for record in data:
            uid = record.get('uid', '')
            
            # Check if duplicate in current batch or existing DB
            if uid in seen_uids or uid in existing_uids:
                duplicates.append(uid)
                DuplicateSerialsLog.objects.create(
                    uid=uid,
                    table_name=table_name,
                    migration_history=migration
                )
            else:
                seen_uids.add(uid)
                clean_data.append(record)
        
        return clean_data, duplicates
    
    def _is_duplicate(self, record, table_name):
        """Check if record is duplicate"""
        uid = record.get('uid', '')
        
        if table_name == 'vendor_data':
            return VendorData.objects.filter(uid=uid).exists()
        elif table_name == 'vqc_data':
            return VQCData.objects.filter(uid=uid).exists()
        elif table_name == 'ft_data':
            return FTData.objects.filter(uid=uid).exists()
        elif table_name == 'charging_station_data':
            return ChargingStationData.objects.filter(uid=uid).exists()
        
        return False
    
    def _bulk_insert_copy(self, data, table_name):
        """Bulk insert using PostgreSQL COPY command"""
        if not data:
            return
        
        # Create CSV buffer
        buffer = StringIO()
        
        if table_name == 'vendor_data':
            fieldnames = ['date', 'mo_number', 'uid', 'ring_status', 'charger_status', 
                         'charger_lot_details', 'rejection_reason', 'vendor']
        elif table_name == 'vqc_data':
            fieldnames = ['logged_timestamp', 'three_de_mo', 'uid', 'sku', 'size', 
                         'ihc_mo', 'ihc', 'makenica', 'vendor', 'status', 'reason', 
                         'pcb_type', 'qc_person_id']
        elif table_name == 'ft_data':
            fieldnames = ['date', 'month', 'mo_number', 'uid', 'status', 'reason', 
                         'size', 'sku', 'shift', 'na_status', 'pcb', 'qc_code', 
                         'qc_person', 'remarks']
        elif table_name == 'charging_station_data':
            fieldnames = ['logged_timestamp', 'uid', 'serial_number', 'status', 'reason', 
                         'mac_id', 'polishing_qc_status', 'after_moulding_status', 'ioc_status']
        else:
            return
        
        writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction='ignore')
        
        for record in data:
            # Replace None with empty string for CSV
            clean_record = {k: (v if v is not None else '') for k, v in record.items()}
            writer.writerow(clean_record)
        
        buffer.seek(0)
        
        # Use COPY command
        with connection.cursor() as cursor:
            cursor.copy_from(
                buffer,
                table_name,
                sep=',',
                columns=fieldnames,
                null=''
            )
    
    def _insert_single_record(self, record, table_name):
        """Insert single record"""
        if table_name == 'vendor_data':
            VendorData.objects.create(**record)
        elif table_name == 'vqc_data':
            VQCData.objects.create(**record)
        elif table_name == 'ft_data':
            FTData.objects.create(**record)
        elif table_name == 'charging_station_data':
            ChargingStationData.objects.create(**record)
