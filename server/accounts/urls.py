from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, LogoutView, RoleSwitchView, MeView, AddressListCreateView, AddressDetailView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("role-switch/", RoleSwitchView.as_view(), name="auth-role-switch"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("addresses/", AddressListCreateView.as_view(), name="address-list"),
    path("addresses/<uuid:pk>/", AddressDetailView.as_view(), name="address-detail"),
]
