# ================================
# apps/configuration/serializers.py
# ================================

from rest_framework import serializers
from apps.configuration.models import GoogleSheetsConfiguration, PostgreSQLConfiguration

class GoogleSheetsConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GoogleSheetsConfiguration
        fields = [
            'id', 'service_account_json', 'vendor_data_url', 'vqc_data_url',
            'ft_data_url', 'cs_data_url', 'vendor_range', 'vqc_3detech_range',
            'vqc_ihc_range', 'vqc_makenica_range', 'ft_range', 'cs_range',
            'is_active', 'last_tested', 'connection_status', 'updated_at'
        ]
        read_only_fields = ['id', 'last_tested', 'connection_status', 'updated_at']
        extra_kwargs = {
            'service_account_json': {'write_only': True}
        }

class PostgreSQLConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostgreSQLConfiguration
        fields = [
            'id', 'host', 'port', 'database_name', 'username', 'password',
            'is_active', 'last_tested', 'connection_status', 'updated_at'
        ]
        read_only_fields = ['id', 'last_tested', 'connection_status', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }
