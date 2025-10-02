# ================================
# apps/configuration/models.py
# ================================

from django.db import models
from apps.users.models import CustomUser
import re

class GoogleSheetsConfiguration(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='sheets_config')
    
    # Service Account JSON (stored as text)
    service_account_json = models.TextField(help_text="Google Service Account JSON content")
    
    # Sheet URLs
    vendor_data_url = models.URLField(max_length=500, help_text="Vendor Data Google Sheet URL")
    vqc_data_url = models.URLField(max_length=500, help_text="VQC Data Google Sheet URL (contains 3 sub-sheets)")
    ft_data_url = models.URLField(max_length=500, help_text="FT Data Google Sheet URL")
    cs_data_url = models.URLField(max_length=500, help_text="Charging Station Data Google Sheet URL")
    
    # Extracted spreadsheet IDs (auto-generated from URLs)
    vendor_spreadsheet_id = models.CharField(max_length=200, blank=True)
    vqc_spreadsheet_id = models.CharField(max_length=200, blank=True)
    ft_spreadsheet_id = models.CharField(max_length=200, blank=True)
    cs_spreadsheet_id = models.CharField(max_length=200, blank=True)
    
    # Sheet ranges (configurable)
    vendor_range = models.CharField(max_length=100, default="Working!A:G")
    vqc_3detech_range = models.CharField(max_length=100, default="3DE TECH!A:M")
    vqc_ihc_range = models.CharField(max_length=100, default="IHC!A:M")
    vqc_makenica_range = models.CharField(max_length=100, default="MAKENICA!A:M")
    ft_range = models.CharField(max_length=100, default="Working!A:O")
    cs_range = models.CharField(max_length=100, default="FINAL STATUS!A:I")
    
    is_active = models.BooleanField(default=True)
    last_tested = models.DateTimeField(null=True, blank=True)
    connection_status = models.CharField(max_length=50, default="NOT_TESTED")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'google_sheets_configuration'
    
    def extract_spreadsheet_id(self, url):
        """Extract spreadsheet ID from Google Sheets URL"""
        # Pattern: https://docs.google.com/spreadsheets/d/{ID}/edit...
        pattern = r'/spreadsheets/d/([a-zA-Z0-9-_]+)'
        match = re.search(pattern, url)
        return match.group(1) if match else None
    
    def save(self, *args, **kwargs):
        # Auto-extract spreadsheet IDs from URLs
        if self.vendor_data_url:
            self.vendor_spreadsheet_id = self.extract_spreadsheet_id(self.vendor_data_url) or ''
        if self.vqc_data_url:
            self.vqc_spreadsheet_id = self.extract_spreadsheet_id(self.vqc_data_url) or ''
        if self.ft_data_url:
            self.ft_spreadsheet_id = self.extract_spreadsheet_id(self.ft_data_url) or ''
        if self.cs_data_url:
            self.cs_spreadsheet_id = self.extract_spreadsheet_id(self.cs_data_url) or ''
        
        super().save(*args, **kwargs)
    
    def get_migration_configs(self):
        """Generate migration sheet configurations"""
        configs = []
        
        # Vendor Data
        if self.vendor_spreadsheet_id:
            configs.append({
                'spreadsheet_id': self.vendor_spreadsheet_id,
                'range': self.vendor_range,
                'table_name': 'vendor_data',
                'vendor': '3DE TECH'  # or make this configurable
            })
        
        # VQC Data - 3 sub-sheets from same spreadsheet
        if self.vqc_spreadsheet_id:
            configs.extend([
                {
                    'spreadsheet_id': self.vqc_spreadsheet_id,
                    'range': self.vqc_3detech_range,
                    'table_name': 'vqc_data',
                    'vendor': '3DE TECH'
                },
                {
                    'spreadsheet_id': self.vqc_spreadsheet_id,
                    'range': self.vqc_ihc_range,
                    'table_name': 'vqc_data',
                    'vendor': 'IHC'
                },
                {
                    'spreadsheet_id': self.vqc_spreadsheet_id,
                    'range': self.vqc_makenica_range,
                    'table_name': 'vqc_data',
                    'vendor': 'MAKENICA'
                }
            ])
        
        # FT Data
        if self.ft_spreadsheet_id:
            configs.append({
                'spreadsheet_id': self.ft_spreadsheet_id,
                'range': self.ft_range,
                'table_name': 'ft_data'
            })
        
        # Charging Station Data
        if self.cs_spreadsheet_id:
            configs.append({
                'spreadsheet_id': self.cs_spreadsheet_id,
                'range': self.cs_range,
                'table_name': 'charging_station_data'
            })
        
        return configs
    
    def __str__(self):
        return f"Configuration for {self.user.username}"


class PostgreSQLConfiguration(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='postgres_config')
    
    host = models.CharField(max_length=255)
    port = models.CharField(max_length=10, default='5432')
    database_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)  # Should be encrypted in production
    
    is_active = models.BooleanField(default=True)
    last_tested = models.DateTimeField(null=True, blank=True)
    connection_status = models.CharField(max_length=50, default="NOT_TESTED")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'postgresql_configuration'
    
    def __str__(self):
        return f"PostgreSQL Config for {self.user.username}"
