from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/reviews/", include("reviews.urls")),
    path("api/v1/stores/", include("stores.urls")),
    path("api/v1/products/", include("catalog.urls")),
    path("api/v1/wallet/", include("wallet.urls")),
    path("api/v1/cart/", include("cart.urls")),
    path("api/v1/", include("orders.urls")),
    path("api/v1/discounts/", include("discounts.urls")),
    path("api/v1/driver/", include("delivery.urls")),
    path("api/v1/admin/", include("adminpanel.urls")),
]
