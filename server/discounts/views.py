from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import IsActiveBuyer, IsActiveAdmin
from .models import Voucher, Promo
from .serializers import (
    VoucherSerializer, VoucherCreateSerializer,
    PromoSerializer, PromoCreateSerializer,
    DiscountValidateSerializer, DiscountValidateResponseSerializer,
)
from drf_spectacular.utils import extend_schema


def compute_discount_amount(obj, discount_type, discount_value, subtotal):
    if discount_type == "fixed":
        return min(discount_value, subtotal)
    percentage = min(discount_value, Decimal("100"))
    return (subtotal * percentage / Decimal("100")).quantize(Decimal("0.01"))


def resolve_discount_code(code, subtotal=Decimal("0")):
    try:
        voucher = Voucher.objects.get(code=code)
        if not voucher.is_valid():
            return None, "Voucher code is expired or fully used."
        amount = compute_discount_amount(voucher, voucher.discount_type, voucher.discount_value, subtotal)
        return {"type": "voucher", "id": voucher.id, "discount_amount": amount, "code": code}, None
    except Voucher.DoesNotExist:
        pass

    try:
        promo = Promo.objects.get(code=code)
        if not promo.is_valid():
            return None, "Promo code is expired or inactive."
        amount = compute_discount_amount(promo, promo.discount_type, promo.discount_value, subtotal)
        return {"type": "promo", "id": promo.id, "discount_amount": amount, "code": code}, None
    except Promo.DoesNotExist:
        pass

    return None, "Invalid discount code."


class DiscountValidateView(APIView):
    """Validate a discount code without applying it."""

    permission_classes = [IsActiveBuyer]
    serializer_class = DiscountValidateSerializer

    @extend_schema(request=DiscountValidateSerializer, responses={200: DiscountValidateResponseSerializer})
    def post(self, request):
        serializer = DiscountValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.validated_data["code"]
        subtotal = serializer.validated_data["subtotal"]

        result, error = resolve_discount_code(code, subtotal)
        if error:
            return Response(
                {"error": {"code": "invalid_discount", "message": error}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(result)


class VoucherListView(APIView):
    """List all currently valid vouchers for buyers."""

    permission_classes = [IsActiveBuyer]
    serializer_class = VoucherSerializer

    @extend_schema(responses={200: VoucherSerializer(many=True)})
    def get(self, request):
        from django.utils import timezone
        vouchers = Voucher.objects.filter(expiry_date__gte=timezone.now().date())
        return Response(VoucherSerializer(vouchers, many=True).data)


class PromoListView(APIView):
    """List all currently valid promos for buyers."""

    permission_classes = [IsActiveBuyer]
    serializer_class = PromoSerializer

    @extend_schema(responses={200: PromoSerializer(many=True)})
    def get(self, request):
        from django.utils import timezone
        promos = Promo.objects.filter(is_active=True, expiry_date__gte=timezone.now().date())
        return Response(PromoSerializer(promos, many=True).data)


class AdminVoucherListView(APIView):
    """Admin: list all vouchers."""

    permission_classes = [IsActiveAdmin]
    serializer_class = VoucherSerializer

    @extend_schema(responses={200: VoucherSerializer(many=True)})
    def get(self, request):
        return Response(VoucherSerializer(Voucher.objects.all(), many=True).data)

    @extend_schema(request=VoucherCreateSerializer, responses={201: VoucherSerializer})
    def post(self, request):
        serializer = VoucherCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        voucher = serializer.save(created_by=request.user)
        return Response(VoucherSerializer(voucher).data, status=status.HTTP_201_CREATED)


class AdminVoucherDetailView(APIView):
    """Admin: retrieve a single voucher."""

    permission_classes = [IsActiveAdmin]
    serializer_class = VoucherSerializer

    @extend_schema(responses={200: VoucherSerializer})
    def get(self, request, pk):
        from django.shortcuts import get_object_or_404
        voucher = get_object_or_404(Voucher, pk=pk)
        return Response(VoucherSerializer(voucher).data)


class AdminPromoListView(APIView):
    """Admin: list all promos."""

    permission_classes = [IsActiveAdmin]
    serializer_class = PromoSerializer

    @extend_schema(responses={200: PromoSerializer(many=True)})
    def get(self, request):
        return Response(PromoSerializer(Promo.objects.all(), many=True).data)

    @extend_schema(request=PromoCreateSerializer, responses={201: PromoSerializer})
    def post(self, request):
        serializer = PromoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        promo = serializer.save(created_by=request.user)
        return Response(PromoSerializer(promo).data, status=status.HTTP_201_CREATED)


class AdminPromoDetailView(APIView):
    """Admin: retrieve a single promo."""

    permission_classes = [IsActiveAdmin]
    serializer_class = PromoSerializer

    @extend_schema(responses={200: PromoSerializer})
    def get(self, request, pk):
        from django.shortcuts import get_object_or_404
        promo = get_object_or_404(Promo, pk=pk)
        return Response(PromoSerializer(promo).data)
