# ================================
# apps/etl/models.py
# ================================

from django.db import models
from apps.users.models import CustomUser
import re

class VendorData(models.Model):
    VENDOR_CHOICES = [
        ('3DE TECH', '3DE TECH'),
        ('IHC', 'IHC'),
        ('MAKENICA', 'MAKENICA'),
    ]
    
    date = models.DateField(null=True, blank=True)
    mo_number = models.CharField(max_length=100)
    uid = models.CharField(max_length=200, unique=True, db_index=True)
    ring_status = models.CharField(max_length=50, blank=True, default='')
    charger_status = models.CharField(max_length=50, blank=True, null=True)
    charger_lot_details = models.TextField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True, null=True)
    vendor = models.CharField(max_length=50, choices=VENDOR_CHOICES)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vendor_data'
        indexes = [
            models.Index(fields=['uid']),
            models.Index(fields=['vendor']),
            models.Index(fields=['date']),
        ]
    
    def save(self, *args, **kwargs):
        # Convert all text fields to uppercase
        self.mo_number = self.mo_number.upper() if self.mo_number else self.mo_number
        self.uid = self.uid.upper() if self.uid else self.uid
        self.ring_status = self.ring_status.upper() if self.ring_status else self.ring_status
        self.charger_status = self.charger_status.upper() if self.charger_status else self.charger_status
        self.rejection_reason = self.rejection_reason.upper() if self.rejection_reason else self.rejection_reason
        self.vendor = self.vendor.upper() if self.vendor else self.vendor
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.uid} - {self.vendor}"


class VQCData(models.Model):
    VENDOR_CHOICES = [
        ('3DE TECH', '3DE TECH'),
        ('IHC', 'IHC'),
        ('MAKENICA', 'MAKENICA'),
    ]
    
    logged_timestamp = models.DateField(null=True, blank=True)
    three_de_mo = models.CharField(max_length=100, blank=True, null=True)
    uid = models.CharField(max_length=200, db_index=True)
    sku = models.CharField(max_length=100, blank=True, null=True)
    size = models.CharField(max_length=20, blank=True, null=True)
    ihc_mo = models.CharField(max_length=100, blank=True, null=True)
    ihc = models.CharField(max_length=200, blank=True, null=True)
    makenica = models.CharField(max_length=200, blank=True, null=True)
    vendor = models.CharField(max_length=50, choices=VENDOR_CHOICES)
    STATUS_CHOICES = [
        ('ACCEPTED', 'ACCEPTED'),
        ('SCRAP', 'SCRAP'),
        ('WABI-SABI', 'WABI-SABI'),
        ('RT CONVERSION', 'RT CONVERSION'),
    ]
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    pcb_type = models.CharField(max_length=100, blank=True, null=True)
    qc_person_id = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vqc_data'
        indexes = [
            models.Index(fields=['uid']),
            models.Index(fields=['vendor']),
            models.Index(fields=['status']),
            models.Index(fields=['logged_timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        # Convert all text fields to uppercase
        if self.three_de_mo:
            self.three_de_mo = self.three_de_mo.upper()
        if self.uid:
            self.uid = self.uid.upper()
        if self.sku:
            self.sku = self.sku.upper()
        if self.size:
            self.size = self.size.upper()
        if self.ihc_mo:
            self.ihc_mo = self.ihc_mo.upper()
        if self.ihc:
            self.ihc = self.ihc.upper()
        if self.makenica:
            self.makenica = self.makenica.upper()
        if self.vendor:
            self.vendor = self.vendor.upper()
        if self.status:
            self.status = self.status.upper()
        if self.reason:
            self.reason = self.reason.upper()
        if self.pcb_type:
            self.pcb_type = self.pcb_type.upper()
        if self.qc_person_id:
            self.qc_person_id = self.qc_person_id.upper()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.uid} - {self.vendor} - {self.status}"


class FTData(models.Model):
    STATUS_CHOICES = [
        ('ACCEPTED', 'ACCEPTED'),
        ('WABI-SABI', 'WABI-SABI'),
        ('SCRAP', 'SCRAP'),
        ('RT CONVERSION', 'RT CONVERSION'),
        ('FUNCTIONAL BUT REJECTED', 'FUNCTIONAL BUT REJECTED'),
    ]
    
    date = models.DateField(null=True, blank=True)
    month = models.CharField(max_length=20, blank=True, null=True)
    mo_number = models.CharField(max_length=100)
    uid = models.CharField(max_length=200, db_index=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    size = models.CharField(max_length=20, blank=True, null=True)
    sku = models.CharField(max_length=100, blank=True, null=True)
    shift = models.CharField(max_length=50, blank=True, null=True)
    na_status = models.CharField(max_length=50, blank=True, null=True)
    pcb = models.CharField(max_length=100, blank=True, null=True)
    qc_code = models.CharField(max_length=100, blank=True, null=True)
    qc_person = models.CharField(max_length=100, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ft_data'
        indexes = [
            models.Index(fields=['uid']),
            models.Index(fields=['status']),
            models.Index(fields=['date']),
        ]
    
    def save(self, *args, **kwargs):
        # Convert all text fields to uppercase
        fields_to_upper = [
            'month', 'mo_number', 'uid', 'status', 'reason', 'size', 
            'sku', 'shift', 'na_status', 'pcb', 'qc_code', 'qc_person', 'remarks'
        ]
        for field in fields_to_upper:
            value = getattr(self, field)
            if value:
                setattr(self, field, value.upper())
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.uid} - {self.status}"


class ChargingStationData(models.Model):
    STATUS_CHOICES = [
        ('ACCEPTED', 'ACCEPTED'),
        ('REJECTED', 'REJECTED'),
    ]
    
    logged_timestamp = models.DateField(null=True, blank=True)
    uid = models.CharField(max_length=200, db_index=True)
    serial_number = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, blank=True, null=True)
    reason = models.TextField(blank=True, null=True)
    mac_id = models.CharField(max_length=100, blank=True, null=True)
    polishing_qc_status = models.CharField(max_length=50, blank=True, null=True)
    after_moulding_status = models.CharField(max_length=50, blank=True, null=True)
    ioc_status = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'charging_station_data'
        indexes = [
            models.Index(fields=['uid']),
            models.Index(fields=['status']),
            models.Index(fields=['logged_timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        # Convert all text fields to uppercase
        fields_to_upper = [
            'uid', 'serial_number', 'status', 'reason', 'mac_id',
            'polishing_qc_status', 'after_moulding_status', 'ioc_status'
        ]
        for field in fields_to_upper:
            value = getattr(self, field)
            if value:
                setattr(self, field, value.upper())
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.uid} - {self.status}"


class MigrationHistory(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'PENDING'),
        ('RUNNING', 'RUNNING'),
        ('COMPLETED', 'COMPLETED'),
        ('FAILED', 'FAILED'),
    ]
    
    sheet_name = models.CharField(max_length=200)
    table_name = models.CharField(max_length=100)
    records_count = models.IntegerField(default=0)
    duration_seconds = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    error_message = models.TextField(blank=True, null=True)
    migration_mode = models.CharField(max_length=20, default='FAST')  # FAST or SLOW
    done_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'migration_history'
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.sheet_name} → {self.table_name} - {self.status}"


class DuplicateSerialsLog(models.Model):
    uid = models.CharField(max_length=200)
    table_name = models.CharField(max_length=100)
    detected_at = models.DateTimeField(auto_now_add=True)
    migration_history = models.ForeignKey(MigrationHistory, on_delete=models.CASCADE, null=True)
    
    class Meta:
        db_table = 'duplicate_serials_log'
    
    def __str__(self):
        return f"Duplicate: {self.uid} in {self.table_name}"
