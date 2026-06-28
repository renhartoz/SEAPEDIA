from django.db import models
from django.conf import settings
import uuid
from stores.models import Store
from catalog.models import Product
from accounts.models import DeliveryAddress


class Order(models.Model):
    DELIVERY_CHOICES = [
        ("instant", "Instant"),
        ("next_day", "Next Day"),
        ("regular", "Regular"),
    ]
    STATUS_CHOICES = [
        ("Sedang Dikemas", "Sedang Dikemas"),
        ("Menunggu Pengirim", "Menunggu Pengirim"),
        ("Sedang Dikirim", "Sedang Dikirim"),
        ("Pesanan Selesai", "Pesanan Selesai"),
        ("Dikembalikan", "Dikembalikan"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="orders"
    )
    store = models.ForeignKey(Store, on_delete=models.PROTECT, related_name="orders")
    address = models.ForeignKey(
        DeliveryAddress, on_delete=models.PROTECT, related_name="orders"
    )
    delivery_method = models.CharField(max_length=20, choices=DELIVERY_CHOICES)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    delivery_fee = models.DecimalField(max_digits=14, decimal_places=2)
    ppn_amount = models.DecimalField(max_digits=14, decimal_places=2)
    total = models.DecimalField(max_digits=14, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default="Sedang Dikemas")
    discount_code = models.CharField(max_length=50, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order#{self.pk} {self.buyer.username} → {self.store.name}"


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, related_name="order_items"
    )
    product_name = models.CharField(max_length=200)
    product_price = models.DecimalField(max_digits=14, decimal_places=2)
    quantity = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=14, decimal_places=2)

    def __str__(self):
        return f"{self.product_name} x{self.quantity}"


class OrderStatusHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    status = models.CharField(max_length=30)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Order#{self.order_id} → {self.status}"
