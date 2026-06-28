from django.urls import path
from .views import (
    AdminStatsView,
    AdminUserListView,
    AdminStoreListView,
    AdminProductListView,
    AdminOrderListView,
    AdminVoucherListView,
    AdminVoucherDetailView,
    AdminPromoListView,
    AdminPromoDetailView,
    AdminJobListView,
    AdminOverdueOrdersView,
    AdminSimulateNextDayView,
)

urlpatterns = [
    path("stats/", AdminStatsView.as_view()),
    path("users/", AdminUserListView.as_view()),
    path("stores/", AdminStoreListView.as_view()),
    path("products/", AdminProductListView.as_view()),
    path("orders/", AdminOrderListView.as_view()),
    path("vouchers/", AdminVoucherListView.as_view()),
    path("vouchers/<uuid:pk>/", AdminVoucherDetailView.as_view()),
    path("promos/", AdminPromoListView.as_view()),
    path("promos/<uuid:pk>/", AdminPromoDetailView.as_view()),
    path("jobs/", AdminJobListView.as_view()),
    path("overdue/", AdminOverdueOrdersView.as_view()),
    path("simulate-next-day/", AdminSimulateNextDayView.as_view()),
]
