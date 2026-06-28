from django.urls import path
from .views import MyStoreView, PublicStoreListView, PublicStoreDetailView

urlpatterns = [
    path("", PublicStoreListView.as_view()),
    path("me/", MyStoreView.as_view()),
    path("<uuid:pk>/", PublicStoreDetailView.as_view()),
]
