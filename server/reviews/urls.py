from django.urls import path
from .views import AppReviewListView, AppReviewCreateView

urlpatterns = [
    path("", AppReviewListView.as_view(), name="review-list"),
    path("create/", AppReviewCreateView.as_view(), name="review-create"),
]
