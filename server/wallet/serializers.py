from rest_framework import serializers
from .models import Wallet, WalletTransaction


class WalletTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletTransaction
        fields = ["id", "transaction_type", "amount", "description", "created_at"]


class WalletSerializer(serializers.ModelSerializer):
    transactions = WalletTransactionSerializer(many=True, read_only=True)

    class Meta:
        model = Wallet
        fields = ["id", "balance", "updated_at", "transactions"]


class TopUpSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Top-up amount must be positive.")
        return value
