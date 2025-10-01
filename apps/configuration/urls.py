# ================================
# apps/configuration/urls.py
# ================================

from django.urls import path
from apps.configuration.views import (
    GoogleSheetsConfigurationView,
    TestGoogleSheetsConnectionView,
    PostgreSQLConfigurationView,
    TestPostgreSQLConnectionView
)

urlpatterns = [
    path('google-sheets/', GoogleSheetsConfigurationView.as_view(), name='google-sheets-config'),
    path('google-sheets/test/', TestGoogleSheetsConnectionView.as_view(), name='test-google-sheets'),
    path('postgresql/', PostgreSQLConfigurationView.as_view(), name='postgresql-config'),
    path('postgresql/test/', TestPostgreSQLConnectionView.as_view(), name='test-postgresql'),
]
