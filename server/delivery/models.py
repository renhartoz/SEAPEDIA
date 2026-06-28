from django.db import models
from django.conf import settings
import uuid
from orders.models import Order


class DeliveryJob(models.Model):
    STATUS_CHOICES = [
        ("available", "Available"),
        ("taken", "Taken"),
        ("completed", "Completed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.PROTECT, related_name="delivery_job")
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_jobs",
    )
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="available")
    taken_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    driver_earnings = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        ordering = ["-order__created_at"]

    def __str__(self):
        return f"Job for Order#{self.order_id} — {self.status}"
