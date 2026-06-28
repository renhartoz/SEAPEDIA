from django.urls import path
from .views import WalletView, WalletTopUpView

urlpatterns = [
    path("", WalletView.as_view()),
    path("topup/", WalletTopUpView.as_view()),
]
