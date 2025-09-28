# ================================
# apps/authentication/urls.py
# ================================

from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,  # Import this
    TokenRefreshView
)
# from .views import LoginView # Commented out as it's no longer used for login

urlpatterns = [
    path('login/', TokenObtainPairView.as_view(), name='login'), # Use TokenObtainPairView here
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]