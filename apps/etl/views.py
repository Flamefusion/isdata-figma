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

logger = logging.getLogger(__name__)

class StartMigrationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminOrSuperUser]
    
    def post(self, request):
        """Start data migration from Google Sheets"""
        serializer = StartMigrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        mode = serializer.validated_data['mode']
        sheet_configs = serializer.validated_data['sheets']
        
        # Example sheet_configs format:
        # [
        #     {
        #         'spreadsheet_id': '1H3Vt4rDarzZFpxqNwlU62etIKygt70zntrVeighRGw',
        #         'range': 'FINAL STATUS!A:G',
        #         'table_name': 'vendor_data',
        #         'vendor': '3DE TECH'
        #     }
        # ]
        
        try:
            # Get service account file from settings
            service_account_file = settings.GOOGLE_SERVICE_ACCOUNT_FILE
            
            # Initialize migration service
            migration_service = MigrationService(request.user, service_account_file)
            
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
