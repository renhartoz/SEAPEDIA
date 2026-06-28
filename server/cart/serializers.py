from rest_framework import serializers
from catalog.serializers import ProductPublicSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductPublicSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "product_id", "quantity", "subtotal"]

    def get_subtotal(self, obj) -> float:
        return float(obj.product.price * obj.quantity)


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    store_id = serializers.UUIDField(source="store.id", read_only=True, default=None)
    store_name = serializers.CharField(source="store.name", read_only=True, default=None)
    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ["id", "store_id", "store_name", "items", "item_count", "subtotal", "updated_at"]

    def get_item_count(self, obj) -> int:
        return obj.items.count()

    def get_subtotal(self, obj) -> float:
        return float(sum(item.product.price * item.quantity for item in obj.items.select_related("product").all()))


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
