# ================================
# apps/database_manager/urls.py
# ================================

from django.urls import path
from .views import TestDatabaseConnectionView

urlpatterns = [
    path('test-connection/', TestDatabaseConnectionView.as_view(), name='test-connection'),
]