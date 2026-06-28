from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from core.permissions import IsActiveBuyer
from catalog.models import Product
from .models import Cart, CartItem
from .serializers import CartSerializer, AddToCartSerializer, UpdateCartItemSerializer
from drf_spectacular.utils import extend_schema


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(buyer=user)
    return cart


class CartView(APIView):
    """Get the buyer's cart summary."""

    permission_classes = [IsActiveBuyer]
    serializer_class = CartSerializer

    @extend_schema(responses={200: CartSerializer})
    def get(self, request):
        cart = get_or_create_cart(request.user)
        return Response(CartSerializer(cart).data)

    @extend_schema(responses={204: None})
    def delete(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()
        cart.store = None
        cart.save(update_fields=["store"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartItemAddView(APIView):
    """Add a product to cart, enforcing single-store rule."""

    permission_classes = [IsActiveBuyer]
    serializer_class = AddToCartSerializer

    @extend_schema(request=AddToCartSerializer, responses={200: CartSerializer})
    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product_id = serializer.validated_data["product_id"]
        quantity = serializer.validated_data["quantity"]

        product = get_object_or_404(Product, pk=product_id, is_active=True)

        if product.stock < quantity:
            return Response(
                {"error": {"code": "insufficient_stock", "message": "Not enough stock."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_or_create_cart(request.user)

        if cart.store_id and cart.store_id != product.store_id:
            return Response(
                {
                    "error": {
                        "code": "single_store_violation",
                        "message": "Your cart already has items from a different store. Clear your cart first.",
                    }
                },
                status=status.HTTP_409_CONFLICT,
            )

        if cart.store_id is None:
            cart.store = product.store
            cart.save(update_fields=["store"])

        item, created = CartItem.objects.get_or_create(cart=cart, product=product)
        if created:
            item.quantity = quantity
        else:
            item.quantity += quantity
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemUpdateView(APIView):
    """Update quantity or remove a cart item."""

    permission_classes = [IsActiveBuyer]
    serializer_class = UpdateCartItemSerializer

    @extend_schema(request=UpdateCartItemSerializer, responses={200: CartSerializer})
    def patch(self, request, pk):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item.quantity = serializer.validated_data["quantity"]
        item.save()
        return Response(CartSerializer(cart).data)

    @extend_schema(responses={204: None})
    def delete(self, request, pk):
        cart = get_or_create_cart(request.user)
        item = get_object_or_404(CartItem, pk=pk, cart=cart)
        item.delete()
        if not cart.items.exists():
            cart.store = None
            cart.save(update_fields=["store"])
        return Response(status=status.HTTP_204_NO_CONTENT)
