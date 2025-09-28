# ================================
# apps/users/models.py
# ================================

from django.contrib.auth.models import AbstractUser
from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings
import base64

class CustomUser(AbstractUser):
    USER_ROLES = [
        ('NORMAL', 'Normal User'),
        ('ADMIN', 'Admin User'),
        ('SUPER', 'Super User'),
    ]
    
    role = models.CharField(max_length=10, choices=USER_ROLES, default='NORMAL')
    
    # Encrypted database credentials
    db_host = models.TextField(blank=True, null=True)
    db_port = models.CharField(max_length=10, default='5432')
    db_name = models.TextField(blank=True, null=True)
    db_password = models.TextField(blank=True, null=True)
    db_username = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def encrypt_field(self, value):
        """Encrypt sensitive field data"""
        if not value:
            return None
        key = settings.ENCRYPTION_KEY.encode()[:32]  # Ensure 32 bytes
        f = Fernet(base64.urlsafe_b64encode(key))
        return f.encrypt(value.encode()).decode()

    def decrypt_field(self, encrypted_value):
        """Decrypt sensitive field data"""
        if not encrypted_value:
            return None
        key = settings.ENCRYPTION_KEY.encode()[:32]  # Ensure 32 bytes
        f = Fernet(base64.urlsafe_b64encode(key))
        return f.decrypt(encrypted_value.encode()).decode()

    def set_db_credentials(self, host, port, db_name, db_password, db_username):
        """Set encrypted database credentials"""
        self.db_host = self.encrypt_field(host)
        self.db_port = port
        self.db_name = self.encrypt_field(db_name)
        self.db_password = self.encrypt_field(db_password)
        self.db_username = self.encrypt_field(db_username)

    def get_db_credentials(self):
        """Get decrypted database credentials"""
        return {
            'host': self.decrypt_field(self.db_host) if self.db_host else None,
            'port': self.db_port,
            'database': self.decrypt_field(self.db_name) if self.db_name else None,
            'password': self.decrypt_field(self.db_password) if self.db_password else None,
            'username': self.decrypt_field(self.db_username) if self.db_username else None,
        }

    @property
    def can_read_database(self):
        return self.role in ['NORMAL', 'ADMIN', 'SUPER']

    @property
    def can_write_database(self):
        return self.role in ['ADMIN', 'SUPER']

    @property
    def can_create_schema(self):
        return self.role in ['ADMIN', 'SUPER']

    @property
    def can_drop_schema(self):
        return self.role == 'SUPER'

    @property
    def can_drop_database(self):
        return self.role == 'SUPER'

    @property
    def can_manage_users(self):
        return self.role == 'SUPER'

    def __str__(self):
        return f"{self.username} ({self.role})"
