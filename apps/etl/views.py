# ================================
# apps/etl/views.py
# ================================

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from apps.permissions.permissions import IsAdminOrSuperUser
from apps.etl.models import MigrationHistory
from apps.etl.serializers import MigrationHistorySerializer, StartMigrationSerializer
from apps.etl.services.migration_service import MigrationService
from django.conf import settings
import logging
import json
import tempfile
import os

logger = logging.getLogger(__name__)

class StartMigrationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Start data migration from Google Sheets"""
        mode = request.data.get('mode', 'FAST')
        
        try:
            # Get user's configuration
            from apps.configuration.models import GoogleSheetsConfiguration
            config = GoogleSheetsConfiguration.objects.get(user=request.user)
            
            # Generate sheet configurations from saved config
            sheet_configs = config.get_migration_configs()
            
            if not sheet_configs:
                return Response({
                    'error': 'No sheet configurations found. Please configure Google Sheets first.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Load service account JSON
            try:
                service_account_data = json.loads(config.service_account_json)
            except (json.JSONDecodeError, TypeError):
                return Response({
                    'error': 'Invalid service account JSON format.'
                }, status=status.HTTP_400_BAD_REQUEST)

            try:
                # Initialize migration service with the JSON object
                migration_service = MigrationService(request.user, service_account_data)
                
                # Start migration
                logger.info(f"Starting migration in {mode} mode for user {request.user.username}")
                migration_records = migration_service.start_migration(sheet_configs, mode)
                
                # Serialize results
                serializer = MigrationHistorySerializer(migration_records, many=True)
                
                return Response({
                    'message': f'Migration completed in {mode} mode',
                    'migrations': serializer.data
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                logger.error(f"Migration failed during service execution: {e}")
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except GoogleSheetsConfiguration.DoesNotExist:
            return Response({
                'error': 'Google Sheets configuration not found. Please configure first.'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Migration failed: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class MigrationHistoryListView(generics.ListAPIView):
    """Get migration history"""
    permission_classes = [IsAuthenticated]
    serializer_class = MigrationHistorySerializer
    
    def get_queryset(self):
        # Filter by user if not super user
        if self.request.user.role == 'SUPER':
            return MigrationHistory.objects.all()
        return MigrationHistory.objects.filter(done_by=self.request.user)


class MigrationStatusView(APIView):
    """Get current running migrations"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        running_migrations = MigrationHistory.objects.filter(status='RUNNING')
        serializer = MigrationHistorySerializer(running_migrations, many=True)
        
        return Response({
            'running_migrations': serializer.data,
            'count': running_migrations.count()
        })
