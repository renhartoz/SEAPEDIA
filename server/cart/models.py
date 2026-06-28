from django.db import models
from django.conf import settings
import uuid
from stores.models import Store
from catalog.models import Product


class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cart",
    )
    store = models.ForeignKey(
        Store, on_delete=models.SET_NULL, null=True, blank=True, related_name="carts"
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart({self.buyer.username})"


class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "product")

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
