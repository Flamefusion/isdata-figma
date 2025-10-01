# ================================
# apps/configuration/views.py
# ================================

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.configuration.models import GoogleSheetsConfiguration, PostgreSQLConfiguration
from apps.configuration.serializers import GoogleSheetsConfigurationSerializer, PostgreSQLConfigurationSerializer
from apps.etl.utils.google_sheets import GoogleSheetsExtractor
import psycopg2
import json
import tempfile
import os
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class GoogleSheetsConfigurationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's Google Sheets configuration"""
        try:
            config = GoogleSheetsConfiguration.objects.get(user=request.user)
            serializer = GoogleSheetsConfigurationSerializer(config)
            return Response(serializer.data)
        except GoogleSheetsConfiguration.DoesNotExist:
            return Response({
                'message': 'No configuration found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Create or update Google Sheets configuration"""
        try:
            config, created = GoogleSheetsConfiguration.objects.get_or_create(
                user=request.user
            )
            
            serializer = GoogleSheetsConfigurationSerializer(config, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            message = 'Configuration created' if created else 'Configuration updated'
            return Response({
                'message': message,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to save configuration: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        """Delete user's configuration"""
        try:
            config = GoogleSheetsConfiguration.objects.get(user=request.user)
            config.delete()
            return Response({
                'message': 'Configuration deleted'
            }, status=status.HTTP_200_OK)
        except GoogleSheetsConfiguration.DoesNotExist:
            return Response({
                'error': 'No configuration found'
            }, status=status.HTTP_404_NOT_FOUND)


class TestGoogleSheetsConnectionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Test Google Sheets connection"""
        try:
            config = GoogleSheetsConfiguration.objects.get(user=request.user)
            
            # Create temporary service account file
            service_account_data = json.loads(config.service_account_json)
            
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
                json.dump(service_account_data, temp_file)
                temp_file_path = temp_file.name
            
            try:
                # Test connection
                extractor = GoogleSheetsExtractor(temp_file_path)
                if extractor.connect():
                    # Try to access one sheet
                    if config.vendor_spreadsheet_id:
                        extractor.extract_sheet_data(
                            config.vendor_spreadsheet_id,
                            config.vendor_range
                        )
                    
                    # Update config
                    config.connection_status = 'CONNECTED'
                    config.last_tested = datetime.now()
                    config.save()
                    
                    return Response({
                        'status': 'success',
                        'message': 'Google Sheets connection successful'
                    })
                else:
                    config.connection_status = 'FAILED'
                    config.save()
                    return Response({
                        'status': 'error',
                        'message': 'Failed to connect to Google Sheets'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            finally:
                # Clean up temp file
                os.unlink(temp_file_path)
                
        except GoogleSheetsConfiguration.DoesNotExist:
            return Response({
                'error': 'No configuration found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class PostgreSQLConfigurationView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's PostgreSQL configuration"""
        try:
            config = PostgreSQLConfiguration.objects.get(user=request.user)
            serializer = PostgreSQLConfigurationSerializer(config)
            return Response(serializer.data)
        except PostgreSQLConfiguration.DoesNotExist:
            return Response({
                'message': 'No configuration found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request):
        """Create or update PostgreSQL configuration"""
        try:
            config, created = PostgreSQLConfiguration.objects.get_or_create(
                user=request.user
            )
            
            serializer = PostgreSQLConfigurationSerializer(config, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
            message = 'Configuration created' if created else 'Configuration updated'
            return Response({
                'message': message,
                'data': serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Failed to save configuration: {e}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class TestPostgreSQLConnectionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Test PostgreSQL connection"""
        try:
            config = PostgreSQLConfiguration.objects.get(user=request.user)
            
            # Test connection
            conn = psycopg2.connect(
                host=config.host,
                port=config.port,
                database=config.database_name,
                user=config.username,
                password=config.password
            )
            conn.close()
            
            # Update config
            config.connection_status = 'CONNECTED'
            config.last_tested = datetime.now()
            config.save()
            
            return Response({
                'status': 'success',
                'message': 'PostgreSQL connection successful'
            })
            
        except PostgreSQLConfiguration.DoesNotExist:
            return Response({
                'error': 'No configuration found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            
            config = PostgreSQLConfiguration.objects.get(user=request.user)
            config.connection_status = 'FAILED'
            config.save()
            
            return Response({
                'error': f'Connection failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)