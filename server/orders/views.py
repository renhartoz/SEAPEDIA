from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum
from core.permissions import IsActiveBuyer, IsActiveSeller
from accounts.models import DeliveryAddress
from cart.models import Cart
from wallet.models import Wallet, WalletTransaction
from catalog.models import Product
from .models import Order, OrderItem, OrderStatusHistory
from .serializers import (
    OrderSerializer, CheckoutPreviewSerializer, CheckoutSerializer,
    CheckoutPreviewResponseSerializer, BuyerSpendingReportSerializer,
    SellerRevenueReportSerializer
)
from .pricing import calculate_pricing
from drf_spectacular.utils import extend_schema


def _resolve_discount(discount_code, subtotal):
    if not discount_code:
        return Decimal("0"), None

    from discounts.views import resolve_discount_code
    result, error = resolve_discount_code(discount_code, subtotal)
    if error:
        return None, error
    return result["discount_amount"], None


class CheckoutPreviewView(APIView):
    """Return a price breakdown without committing any changes."""

    permission_classes = [IsActiveBuyer]
    serializer_class = CheckoutPreviewSerializer

    @extend_schema(request=CheckoutPreviewSerializer, responses={200: CheckoutPreviewResponseSerializer})
    def post(self, request):
        serializer = CheckoutPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        delivery_method = serializer.validated_data["delivery_method"]
        discount_code = serializer.validated_data.get("discount_code", "")

        try:
            cart = request.user.cart
        except Cart.DoesNotExist:
            return Response(
                {"error": {"code": "empty_cart", "message": "Your cart is empty."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not cart.items.exists():
            return Response(
                {"error": {"code": "empty_cart", "message": "Your cart is empty."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items = [
            {"price": item.product.price, "quantity": item.quantity}
            for item in cart.items.select_related("product").all()
        ]
        raw_subtotal = sum(i["price"] * i["quantity"] for i in items)

        discount_amount, discount_error = _resolve_discount(discount_code, raw_subtotal)
        if discount_error:
            return Response(
                {"error": {"code": "invalid_discount", "message": discount_error}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pricing = calculate_pricing(items, delivery_method, discount_amount or Decimal("0"))
        return Response(pricing)


class CheckoutView(APIView):
    """Create an order: atomically debit wallet, reduce stock, apply discount."""

    permission_classes = [IsActiveBuyer]
    serializer_class = CheckoutSerializer

    @extend_schema(request=CheckoutSerializer, responses={201: OrderSerializer})
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        address_id = serializer.validated_data["address_id"]
        delivery_method = serializer.validated_data["delivery_method"]
        discount_code = serializer.validated_data.get("discount_code", "")

        address = get_object_or_404(DeliveryAddress, pk=address_id, user=request.user)

        try:
            cart = request.user.cart
        except Cart.DoesNotExist:
            return Response(
                {"error": {"code": "empty_cart", "message": "Your cart is empty."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_items = list(cart.items.select_related("product").all())
        if not cart_items:
            return Response(
                {"error": {"code": "empty_cart", "message": "Your cart is empty."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        items_for_pricing = [{"price": ci.product.price, "quantity": ci.quantity} for ci in cart_items]
        raw_subtotal = sum(i["price"] * i["quantity"] for i in items_for_pricing)

        discount_amount, discount_error = _resolve_discount(discount_code, raw_subtotal)
        if discount_error:
            return Response(
                {"error": {"code": "invalid_discount", "message": discount_error}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pricing = calculate_pricing(items_for_pricing, delivery_method, discount_amount or Decimal("0"))

        with transaction.atomic():
            wallet = Wallet.objects.select_for_update().get_or_create(buyer=request.user)[0]
            if wallet.balance < pricing["total"]:
                return Response(
                    {"error": {"code": "insufficient_balance", "message": "Insufficient wallet balance."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for ci in cart_items:
                product = Product.objects.select_for_update().get(pk=ci.product_id)
                if product.stock < ci.quantity:
                    return Response(
                        {
                            "error": {
                                "code": "insufficient_stock",
                                "message": f"Insufficient stock for '{product.name}'.",
                            }
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                product.stock -= ci.quantity
                product.save(update_fields=["stock"])

            if discount_code:
                try:
                    from discounts.models import Voucher
                    voucher = Voucher.objects.select_for_update().get(code=discount_code)
                    voucher.uses_count += 1
                    voucher.save(update_fields=["uses_count"])
                except Voucher.DoesNotExist:
                    pass

            wallet.balance -= pricing["total"]
            wallet.save(update_fields=["balance", "updated_at"])
            WalletTransaction.objects.create(
                wallet=wallet,
                transaction_type="debit",
                amount=pricing["total"],
                description=f"Order from {cart.store.name}",
            )

            order = Order.objects.create(
                buyer=request.user,
                store=cart.store,
                address=address,
                delivery_method=delivery_method,
                subtotal=pricing["subtotal"],
                discount_amount=pricing["discount_amount"],
                delivery_fee=pricing["delivery_fee"],
                ppn_amount=pricing["ppn_amount"],
                total=pricing["total"],
                status="Sedang Dikemas",
                discount_code=discount_code,
            )

            for ci in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=ci.product,
                    product_name=ci.product.name,
                    product_price=ci.product.price,
                    quantity=ci.quantity,
                    subtotal=ci.product.price * ci.quantity,
                )

            OrderStatusHistory.objects.create(
                order=order, status="Sedang Dikemas", actor=request.user
            )

            cart.items.all().delete()
            cart.store = None
            cart.save(update_fields=["store"])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class BuyerOrderListView(APIView):
    """List the authenticated buyer's orders."""

    permission_classes = [IsActiveBuyer]
    serializer_class = OrderSerializer

    @extend_schema(responses={200: OrderSerializer(many=True)})
    def get(self, request):
        orders = Order.objects.filter(buyer=request.user).select_related("store")
        return Response(OrderSerializer(orders, many=True).data)


class BuyerOrderDetailView(APIView):
    """Retrieve a single order belonging to the authenticated buyer."""

    permission_classes = [IsActiveBuyer]
    serializer_class = OrderSerializer

    @extend_schema(responses={200: OrderSerializer})
    def get(self, request, pk):
        order = get_object_or_404(
            Order.objects.prefetch_related("items", "status_history__actor").select_related("store"),
            pk=pk,
            buyer=request.user,
        )
        return Response(OrderSerializer(order).data)


class BuyerSpendingReportView(APIView):
    """Buyer spending summary."""

    permission_classes = [IsActiveBuyer]
    serializer_class = BuyerSpendingReportSerializer

    @extend_schema(responses={200: BuyerSpendingReportSerializer})
    def get(self, request):
        orders = Order.objects.filter(buyer=request.user)
        totals = orders.aggregate(
            total_spent=Sum("total"),
            total_discount=Sum("discount_amount"),
            total_ppn=Sum("ppn_amount"),
            total_delivery=Sum("delivery_fee"),
        )
        return Response(
            {
                "order_count": orders.count(),
                "total_spent": totals["total_spent"] or Decimal("0"),
                "total_discount_saved": totals["total_discount"] or Decimal("0"),
                "total_ppn_paid": totals["total_ppn"] or Decimal("0"),
                "total_delivery_paid": totals["total_delivery"] or Decimal("0"),
                "orders": OrderSerializer(orders, many=True).data,
            }
        )


class SellerOrderListView(APIView):
    """List orders for the authenticated seller's store."""

    permission_classes = [IsActiveSeller]
    serializer_class = OrderSerializer

    @extend_schema(responses={200: OrderSerializer(many=True)})
    def get(self, request):
        if not hasattr(request.user, "store"):
            return Response([])
        orders = Order.objects.filter(store=request.user.store).select_related("buyer")
        return Response(OrderSerializer(orders, many=True).data)


class SellerOrderDetailView(APIView):
    """Retrieve a single order for the seller's store."""

    permission_classes = [IsActiveSeller]
    serializer_class = OrderSerializer

    @extend_schema(responses={200: OrderSerializer})
    def get(self, request, pk):
        if not hasattr(request.user, "store"):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        order = get_object_or_404(
            Order.objects.prefetch_related("items", "status_history__actor").select_related("buyer"),
            pk=pk,
            store=request.user.store,
        )
        return Response(OrderSerializer(order).data)


class SellerProcessOrderView(APIView):
    """Seller processes an order: Sedang Dikemas → Menunggu Pengirim."""

    permission_classes = [IsActiveSeller]
    serializer_class = OrderSerializer

    @extend_schema(request=None, responses={200: OrderSerializer})
    def post(self, request, pk):
        if not hasattr(request.user, "store"):
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        order = get_object_or_404(Order, pk=pk, store=request.user.store)

        if order.status != "Sedang Dikemas":
            return Response(
                {
                    "error": {
                        "code": "invalid_status_transition",
                        "message": f"Order is '{order.status}', cannot process.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            order.status = "Menunggu Pengirim"
            order.save(update_fields=["status"])
            OrderStatusHistory.objects.create(
                order=order, status="Menunggu Pengirim", actor=request.user
            )

            from delivery.models import DeliveryJob
            DeliveryJob.objects.get_or_create(order=order)

        return Response(OrderSerializer(order).data)


class SellerRevenueReportView(APIView):
    """Seller revenue summary — completed orders only."""

    permission_classes = [IsActiveSeller]
    serializer_class = SellerRevenueReportSerializer

    @extend_schema(responses={200: SellerRevenueReportSerializer})
    def get(self, request):
        if not hasattr(request.user, "store"):
            return Response({"order_count": 0, "completed_order_count": 0, "total_revenue": 0, "total_discount_given": 0, "orders": []})

        orders = Order.objects.filter(store=request.user.store)
        completed = orders.filter(status="Pesanan Selesai")
        totals = completed.aggregate(
            total_revenue=Sum("subtotal"),
            total_discount=Sum("discount_amount"),
        )
        return Response(
            {
                "order_count": orders.count(),
                "completed_order_count": completed.count(),
                "total_revenue": totals["total_revenue"] or Decimal("0"),
                "total_discount_given": totals["total_discount"] or Decimal("0"),
                "orders": OrderSerializer(orders, many=True).data,
            }
        )
