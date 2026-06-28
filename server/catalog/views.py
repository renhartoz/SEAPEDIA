from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404
from core.permissions import IsActiveSeller
from .models import Product
from .serializers import ProductSerializer, ProductPublicSerializer
from drf_spectacular.utils import extend_schema


class SellerProductListCreateView(APIView):
    """List or create the seller's own products."""

    permission_classes = [IsActiveSeller]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ProductSerializer

    @extend_schema(responses={200: ProductSerializer(many=True)})
    def get(self, request):
        if not hasattr(request.user, "store"):
            return Response([], status=status.HTTP_200_OK)
        products = Product.objects.filter(store=request.user.store)
        return Response(ProductSerializer(products, many=True).data)

    @extend_schema(request=ProductSerializer, responses={201: ProductSerializer})
    def post(self, request):
        if not hasattr(request.user, "store"):
            return Response(
                {"detail": "Create a store before adding products."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = ProductSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(store=request.user.store)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SellerProductDetailView(APIView):
    """Retrieve, update, or delete a seller's own product."""

    permission_classes = [IsActiveSeller]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = ProductSerializer

    def _get_owned_product(self, request, pk):
        if not hasattr(request.user, "store"):
            return None
        return get_object_or_404(Product, pk=pk, store=request.user.store)

    @extend_schema(responses={200: ProductSerializer})
    def get(self, request, pk):
        product = self._get_owned_product(request, pk)
        if product is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product).data)

    @extend_schema(request=ProductSerializer, responses={200: ProductSerializer})
    def patch(self, request, pk):
        product = self._get_owned_product(request, pk)
        if product is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(
            product, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(responses={204: None})
    def delete(self, request, pk):
        product = self._get_owned_product(request, pk)
        if product is None:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicProductListView(APIView):
    """List active products (public). Supports ?search= and ?store= filters."""

    permission_classes = [AllowAny]
    serializer_class = ProductPublicSerializer

    @extend_schema(responses={200: ProductPublicSerializer(many=True)})
    def get(self, request):
        qs = Product.objects.filter(is_active=True).select_related("store")
        search = request.query_params.get("search", "").strip()
        store_id = request.query_params.get("store", "").strip()
        if search:
            qs = qs.filter(name__icontains=search)
        if store_id:
            qs = qs.filter(store_id=store_id)
        serializer = ProductPublicSerializer(qs, many=True)
        return Response(serializer.data)


class PublicProductDetailView(APIView):
    """Retrieve a single active product by ID (public)."""

    permission_classes = [AllowAny]
    serializer_class = ProductPublicSerializer

    @extend_schema(responses={200: ProductPublicSerializer})
    def get(self, request, pk):
        product = get_object_or_404(
            Product.objects.select_related("store"), pk=pk, is_active=True
        )
        return Response(ProductPublicSerializer(product).data)
