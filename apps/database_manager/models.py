# ================================
# apps/database_manager/models.py
# ================================

from django.db import models
from apps.users.models import CustomUser

class DatabaseConnection(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    last_ping = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=False)
    connection_pool_size = models.IntegerField(default=5)
    
    def __str__(self):
        return f"DB Connection for {self.user.username}"