# ================================
# apps/etl/serializers.py
# ================================

from rest_framework import serializers
from apps.etl.models import MigrationHistory, DuplicateSerialsLog

class MigrationHistorySerializer(serializers.ModelSerializer):
    done_by_username = serializers.CharField(source='done_by.username', read_only=True)
    
    class Meta:
        model = MigrationHistory
        fields = [
            'id', 'sheet_name', 'table_name', 'records_count', 
            'duration_seconds', 'status', 'error_message', 
            'migration_mode', 'done_by_username', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']

class StartMigrationSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=['FAST', 'SLOW'], default='FAST')
    sheets = serializers.ListField(
        child=serializers.DictField(),
        help_text="List of sheet configurations"
    )

class DuplicateSerialsLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = DuplicateSerialsLog
        fields = ['id', 'uid', 'table_name', 'detected_at', 'migration_history']
