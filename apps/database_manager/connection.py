# ================================
# apps/database_manager/connection.py
# ================================

import psycopg2
from psycopg2 import pool
from django.conf import settings
import threading
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class DatabaseConnectionManager:
    _instance = None
    _lock = threading.Lock()
    _user_pools = {}

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def get_connection_pool(self, user):
        """Get or create connection pool for user"""
        user_id = user.id
        
        if user_id not in self._user_pools:
            creds = user.get_db_credentials()
            
            if not all([creds['host'], creds['database'], creds['username'], creds['password']]):
                raise ValueError("Incomplete database credentials")
            
            try:
                pool_conn = psycopg2.pool.SimpleConnectionPool(
                    1, 10,  # min and max connections
                    host=creds['host'],
                    port=creds['port'],
                    database=creds['database'],
                    user=creds['username'],
                    password=creds['password']
                )
                self._user_pools[user_id] = pool_conn
                logger.info(f"Created connection pool for user {user.username}")
                
            except Exception as e:
                logger.error(f"Failed to create connection pool for {user.username}: {e}")
                raise
        
        return self._user_pools[user_id]

    def get_connection(self, user):
        """Get a connection from user's pool"""
        pool = self.get_connection_pool(user)
        return pool.getconn()

    def return_connection(self, user, connection):
        """Return connection to user's pool"""
        pool = self.get_connection_pool(user)
        pool.putconn(connection)

    def ping_connection(self, user):
        """Ping database to keep connection alive"""
        try:
            connection = self.get_connection(user)
            cursor = connection.cursor()
            cursor.execute("SELECT 1;")
            cursor.close()
            self.return_connection(user, connection)
            return True
        except Exception as e:
            logger.error(f"Ping failed for user {user.username}: {e}")
            return False
