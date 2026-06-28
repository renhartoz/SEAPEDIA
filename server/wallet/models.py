from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import uuid


class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="wallet",
    )
    balance = models.DecimalField(
        max_digits=14, decimal_places=2, default=0, validators=[MinValueValidator(0)]
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet({self.buyer.username}): {self.balance}"


class WalletTransaction(models.Model):
    TYPE_CHOICES = [
        ("topup", "Top Up"),
        ("debit", "Debit"),
        ("refund", "Refund"),
        ("reversal", "Reversal"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.transaction_type} {self.amount} ({self.wallet.buyer.username})"
