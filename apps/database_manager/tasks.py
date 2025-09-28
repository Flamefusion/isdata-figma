# ================================
# apps/database_manager/tasks.py
# ================================

from celery import shared_task
from apps.users.models import CustomUser
from apps.database_manager.models import DatabaseConnection
from apps.database_manager.connection import DatabaseConnectionManager
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task
def ping_all_databases():
    """Ping all user databases every 3 minutes to prevent suspension"""
    manager = DatabaseConnectionManager()
    active_users = CustomUser.objects.filter(is_active=True)
    
    for user in active_users:
        try:
            # Get or create database connection record
            db_conn, created = DatabaseConnection.objects.get_or_create(user=user)
            
            # Ping the database
            success = manager.ping_connection(user)
            
            if success:
                db_conn.is_active = True
                db_conn.last_ping = timezone.now()
                db_conn.save()
                logger.info(f"Successfully pinged database for user: {user.username}")
            else:
                db_conn.is_active = False
                db_conn.save()
                logger.warning(f"Failed to ping database for user: {user.username}")
                
        except Exception as e:
            logger.error(f"Error pinging database for user {user.username}: {e}")
    
    return f"Pinged databases for {active_users.count()} users"
