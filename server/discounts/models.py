from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class Voucher(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=15, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=14, decimal_places=2)
    expiry_date = models.DateField()
    max_uses = models.PositiveIntegerField()
    uses_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="vouchers_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Voucher:{self.code}"

    def is_valid(self):
        return self.expiry_date >= timezone.now().date() and self.uses_count < self.max_uses


class Promo(models.Model):
    DISCOUNT_TYPE_CHOICES = [
        ("percentage", "Percentage"),
        ("fixed", "Fixed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=15, choices=DISCOUNT_TYPE_CHOICES)
    discount_value = models.DecimalField(max_digits=14, decimal_places=2)
    expiry_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="promos_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Promo:{self.code}"

    def is_valid(self):
        return self.is_active and self.expiry_date >= timezone.now().date()
