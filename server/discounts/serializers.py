from decimal import Decimal
from rest_framework import serializers
from django.utils import timezone
from .models import Voucher, Promo


class VoucherSerializer(serializers.ModelSerializer):
    is_valid_now = serializers.SerializerMethodField()

    class Meta:
        model = Voucher
        fields = [
            "id", "code", "discount_type", "discount_value",
            "expiry_date", "max_uses", "uses_count", "is_valid_now", "created_at",
        ]

    def get_is_valid_now(self, obj) -> bool:
        return obj.is_valid()


class VoucherCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher
        fields = ["code", "discount_type", "discount_value", "expiry_date", "max_uses"]

    def validate_discount_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Discount value must be greater than 0.")
        return value

    def validate_max_uses(self, value):
        if value < 1:
            raise serializers.ValidationError("Max uses must be at least 1.")
        return value


class PromoSerializer(serializers.ModelSerializer):
    is_valid_now = serializers.SerializerMethodField()

    class Meta:
        model = Promo
        fields = [
            "id", "code", "discount_type", "discount_value",
            "expiry_date", "is_active", "is_valid_now", "created_at",
        ]

    def get_is_valid_now(self, obj) -> bool:
        return obj.is_valid()


class PromoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promo
        fields = ["code", "discount_type", "discount_value", "expiry_date", "is_active"]

    def validate_discount_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("Discount value must be greater than 0.")
        return value


class DiscountValidateSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=50)
    subtotal = serializers.DecimalField(max_digits=14, decimal_places=2, required=False, default=Decimal("0"))


class DiscountValidateResponseSerializer(serializers.Serializer):
    type = serializers.CharField()
    id = serializers.UUIDField()
    discount_amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    code = serializers.CharField()
