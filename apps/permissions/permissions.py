# ================================
# apps/permissions/permissions.py
# ================================

from rest_framework.permissions import BasePermission

class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SUPER'

class IsAdminOrSuperUser(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'SUPER']

class CanReadDatabase(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.can_read_database

class CanWriteDatabase(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.can_write_database

class CanCreateSchema(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.can_create_schema

class CanDropSchema(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.can_drop_schema
