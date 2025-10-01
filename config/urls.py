# ================================
# config/urls.py
# ================================

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/database/', include('apps.database_manager.urls')),
    path('api/configuration/', include('apps.configuration.urls')),
    path('api/etl/', include('apps.etl.urls')),
]