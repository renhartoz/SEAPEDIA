from django.urls import path
from .views import (
    SellerProductListCreateView,
    SellerProductDetailView,
    PublicProductListView,
    PublicProductDetailView,
)

urlpatterns = [
    path("", PublicProductListView.as_view()),
    path("<uuid:pk>/", PublicProductDetailView.as_view()),
    path("seller/", SellerProductListCreateView.as_view()),
    path("seller/<uuid:pk>/", SellerProductDetailView.as_view()),
]
