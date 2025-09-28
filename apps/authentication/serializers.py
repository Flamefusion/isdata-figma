# ================================
# apps/authentication/serializers.py
# ================================

from rest_framework import serializers
from django.contrib.auth import authenticate
from apps.users.models import CustomUser

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        print(f"LoginSerializer: Received data for validation: {data}") # ADDED LINE
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)
            print(f"LoginSerializer: Result of authenticate: {user}") # ADDED LINE
            if user:
                if user.is_active:
                    data['user'] = user
                else:
                    raise serializers.ValidationError('User account is disabled.')
            else:
                raise serializers.ValidationError('Invalid credentials.')
        else:
            raise serializers.ValidationError('Must provide username and password.')

        return data