# ================================
# apps/users/serializers.py
# ================================

from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class UserProfileSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'permissions', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_permissions(self, obj):
        return {
            'can_read_database': obj.can_read_database,
            'can_write_database': obj.can_write_database,
            'can_create_schema': obj.can_create_schema,
            'can_drop_schema': obj.can_drop_schema,
            'can_drop_database': obj.can_drop_database,
            'can_manage_users': obj.can_manage_users,
        }

class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    db_host = serializers.CharField(required=False)
    db_port = serializers.CharField(default='5432')
    db_name = serializers.CharField(required=False)
    db_password = serializers.CharField(write_only=True, required=False)
    db_username = serializers.CharField(required=False)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'role', 'db_host', 'db_port', 
                 'db_name', 'db_password', 'db_username']

    def create(self, validated_data):
        # Extract database credentials
        db_creds = {
            'host': validated_data.pop('db_host', 'ep-rough-cloud-a5w0fqg0.us-east-2.aws.neon.tech'),
            'port': validated_data.pop('db_port', '5432'),
            'db_name': validated_data.pop('db_name', 'dummy_etl_db'),
            'db_password': validated_data.pop('db_password', 'dummy_password123'),
            'db_username': validated_data.pop('db_username', 'dummy_user'),
        }
        
        # Create user
        user = CustomUser.objects.create_user(**validated_data)
        
        # Set encrypted database credentials
        user.set_db_credentials(**db_creds)
        user.save()
        
        return user