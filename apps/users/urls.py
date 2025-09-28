# ================================
# apps/users/urls.py
# ================================

from django.urls import path
from .views import UserProfileView, CreateUserView

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('create/', CreateUserView.as_view(), name='create-user'),
]