from rest_framework import serializers
from .models import Order, OrderItem, OrderStatusHistory


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True, default=None)

    class Meta:
        model = OrderStatusHistory
        fields = ["id", "status", "actor_username", "note", "created_at"]


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["id", "product_id", "product_name", "product_price", "quantity", "subtotal"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    store_name = serializers.CharField(source="store.name", read_only=True)
    buyer_username = serializers.CharField(source="buyer.username", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "buyer_username", "store_name", "delivery_method",
            "subtotal", "discount_amount", "delivery_fee", "ppn_amount", "total",
            "status", "discount_code", "created_at", "items", "status_history",
        ]


class CheckoutPreviewSerializer(serializers.Serializer):
    delivery_method = serializers.ChoiceField(choices=Order.DELIVERY_CHOICES)
    discount_code = serializers.CharField(required=False, allow_blank=True, default="")


class CheckoutSerializer(serializers.Serializer):
    address_id = serializers.UUIDField()
    delivery_method = serializers.ChoiceField(choices=Order.DELIVERY_CHOICES)
    discount_code = serializers.CharField(required=False, allow_blank=True, default="")


class CheckoutPreviewResponseSerializer(serializers.Serializer):
    subtotal = serializers.DecimalField(max_digits=14, decimal_places=2)
    delivery_fee = serializers.DecimalField(max_digits=14, decimal_places=2)
    discount_amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    ppn_amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    total = serializers.DecimalField(max_digits=14, decimal_places=2)


class BuyerSpendingReportSerializer(serializers.Serializer):
    order_count = serializers.IntegerField()
    total_spent = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_discount_saved = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_ppn_paid = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_delivery_paid = serializers.DecimalField(max_digits=14, decimal_places=2)
    orders = OrderSerializer(many=True)


class SellerRevenueReportSerializer(serializers.Serializer):
    order_count = serializers.IntegerField()
    completed_order_count = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_discount_given = serializers.DecimalField(max_digits=14, decimal_places=2)
    orders = OrderSerializer(many=True)
