# ================================
# apps/database_manager/views.py
# ================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from apps.permissions.permissions import CanReadDatabase
from .connection import DatabaseConnectionManager
import logging

logger = logging.getLogger(__name__)

class TestDatabaseConnectionView(APIView):
    permission_classes = [IsAuthenticated, CanReadDatabase]

    def get(self, request):
        user = request.user
        manager = DatabaseConnectionManager()
        
        try:
            success = manager.ping_connection(user)
            
            if success:
                return Response({
                    'status': 'success',
                    'message': 'Database connection successful',
                    'user_role': user.role
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'status': 'error',
                    'message': 'Database connection failed'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            logger.error(f"Database connection test failed for {user.username}: {e}")
            return Response({
                'status': 'error',
                'message': f'Connection error: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)