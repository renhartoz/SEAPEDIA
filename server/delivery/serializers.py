from rest_framework import serializers
from .models import DeliveryJob
from orders.serializers import OrderSerializer


class DeliveryJobSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    driver_username = serializers.CharField(source="driver.username", read_only=True, default=None)

    class Meta:
        model = DeliveryJob
        fields = [
            "id", "order", "driver_username", "status",
            "taken_at", "completed_at", "driver_earnings",
        ]


class DriverEarningsSerializer(serializers.Serializer):
    total_jobs = serializers.IntegerField()
    completed_jobs = serializers.IntegerField()
    total_earnings = serializers.DecimalField(max_digits=14, decimal_places=2)
