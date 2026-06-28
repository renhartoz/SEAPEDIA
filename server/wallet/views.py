from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from core.permissions import IsActiveBuyer
from .models import Wallet, WalletTransaction
from .serializers import WalletSerializer, TopUpSerializer
from drf_spectacular.utils import extend_schema


def get_or_create_wallet(user):
    wallet, _ = Wallet.objects.get_or_create(buyer=user)
    return wallet


class WalletView(APIView):
    """Get buyer's wallet balance and transaction history."""

    permission_classes = [IsActiveBuyer]
    serializer_class = WalletSerializer

    @extend_schema(responses={200: WalletSerializer})
    def get(self, request):
        wallet = get_or_create_wallet(request.user)
        return Response(WalletSerializer(wallet).data)


class WalletTopUpView(APIView):
    """Dummy top-up: add funds to the buyer's wallet."""

    permission_classes = [IsActiveBuyer]
    serializer_class = TopUpSerializer

    @extend_schema(request=TopUpSerializer, responses={200: WalletSerializer})
    def post(self, request):
        serializer = TopUpSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        amount = serializer.validated_data["amount"]

        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().get_or_create(buyer=request.user)[0]
            wallet.balance += amount
            wallet.save(update_fields=["balance", "updated_at"])
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type="topup",
                amount=amount,
                description="Dummy top-up",
            )

        return Response(WalletSerializer(wallet).data)
