# ================================
# apps/etl/utils/validators.py
# ================================

import re
from datetime import datetime

class DataValidator:
    """Validates and transforms ETL data"""
    
    # Serial number format: RA-CH2-LF3-WB-RT10-0000936
    SERIAL_PATTERN = r'^[A-Z]{2,4}-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-[A-Z0-9]+-\d+$'
    
    @staticmethod
    def validate_serial_number(serial: str) -> bool:
        """Validate serial number format"""
        if not serial:
            return False
        serial_upper = serial.upper().strip()
        return bool(re.match(DataValidator.SERIAL_PATTERN, serial_upper))
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """Convert text to uppercase and strip whitespace"""
        if not text:
            return ''
        return str(text).strip().upper()
    
    @staticmethod
    def parse_date(date_value) -> str:
        """Parse various date formats to YYYY-MM-DD"""
        if not date_value:
            return None
        
        try:
            # Handle datetime objects
            if isinstance(date_value, datetime):
                return date_value.strftime('%Y-%m-%d')
            
            # Handle string dates
            date_str = str(date_value).strip()
            
            # Try different formats
            formats = [
                '%d/%m/%Y',
                '%Y-%m-%d',
                '%m/%d/%Y',
                '%Y-%m-%d %H:%M:%S',
                '%d-%m-%Y',
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
                except ValueError:
                    continue
            
            return None
        except Exception:
            return None
    
    @staticmethod
    def normalize_status(status: str) -> str:
        """Normalize status values"""
        if not status:
            return ''
        
        status_upper = status.strip().upper()
        
        # Map variations to standard values
        status_map = {
            'ACCEPT': 'ACCEPTED',
            'ACCEPTED': 'ACCEPTED',
            'REJECT': 'REJECTED',
            'REJECTED': 'REJECTED',
            'WABI': 'WABI-SABI',
            'WABI-SABI': 'WABI-SABI',
            'SCRAP': 'SCRAP',
            'RT CONVERSION': 'RT CONVERSION',
            'FUNCTIONAL BUT REJECTED': 'FUNCTIONAL BUT REJECTED',
        }
        
        return status_map.get(status_upper, status_upper)
