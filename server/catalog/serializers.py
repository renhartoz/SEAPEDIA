from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id", "store", "name", "description", "price",
            "stock", "image", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "store", "created_at", "updated_at"]

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Price must be non-negative.")
        return value


class ProductPublicSerializer(serializers.ModelSerializer):
    store_id = serializers.UUIDField(source="store.id", read_only=True)
    store_name = serializers.CharField(source="store.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "store_id", "store_name", "name", "description",
            "price", "stock", "image", "created_at",
        ]
