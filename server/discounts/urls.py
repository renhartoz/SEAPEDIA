from django.urls import path
from .views import (
    DiscountValidateView,
    VoucherListView,
    PromoListView,
)

urlpatterns = [
    path("validate/", DiscountValidateView.as_view()),
    path("vouchers/", VoucherListView.as_view()),
    path("promos/", PromoListView.as_view()),
]
