from django.urls import path
from .views import CartView, CartItemAddView, CartItemUpdateView

urlpatterns = [
    path("", CartView.as_view()),
    path("items/", CartItemAddView.as_view()),
    path("items/<uuid:pk>/", CartItemUpdateView.as_view()),
]
