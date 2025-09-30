# ================================
# apps/etl/urls.py
# ================================

from django.urls import path
from apps.etl.views import (
    StartMigrationView,
    MigrationHistoryListView,
    MigrationStatusView
)

urlpatterns = [
    path('migration/start/', StartMigrationView.as_view(), name='start-migration'),
    path('migration/history/', MigrationHistoryListView.as_view(), name='migration-history'),
    path('migration/status/', MigrationStatusView.as_view(), name='migration-status'),
]