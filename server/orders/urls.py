from django.urls import path
from .views import (
    CheckoutPreviewView,
    CheckoutView,
    BuyerOrderListView,
    BuyerOrderDetailView,
    BuyerSpendingReportView,
    SellerOrderListView,
    SellerOrderDetailView,
    SellerProcessOrderView,
    SellerRevenueReportView,
)

urlpatterns = [
    path("checkout/preview/", CheckoutPreviewView.as_view()),
    path("checkout/", CheckoutView.as_view()),
    path("orders/", BuyerOrderListView.as_view()),
    path("orders/<uuid:pk>/", BuyerOrderDetailView.as_view()),
    path("buyer/reports/", BuyerSpendingReportView.as_view()),
    path("seller/orders/", SellerOrderListView.as_view()),
    path("seller/orders/<uuid:pk>/", SellerOrderDetailView.as_view()),
    path("seller/orders/<uuid:pk>/process/", SellerProcessOrderView.as_view()),
    path("seller/reports/", SellerRevenueReportView.as_view()),
]
