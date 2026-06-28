from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from core.permissions import IsActiveSeller
from .models import Store
from .serializers import StoreSerializer, StorePublicSerializer
from drf_spectacular.utils import extend_schema


class MyStoreView(APIView):
    """Get, create, or update the authenticated seller's store."""

    permission_classes = [IsActiveSeller]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = StoreSerializer

    @extend_schema(responses={200: StoreSerializer})
    def get(self, request):
        try:
            store = request.user.store
        except Store.DoesNotExist:
            return Response({"detail": "You do not have a store yet."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StoreSerializer(store).data)

    @extend_schema(request=StoreSerializer, responses={201: StoreSerializer})
    def post(self, request):
        if hasattr(request.user, "store"):
            return Response(
                {"detail": "You already have a store."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = StoreSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save(seller=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(request=StoreSerializer, responses={200: StoreSerializer})
    def patch(self, request):
        try:
            store = request.user.store
        except Store.DoesNotExist:
            return Response({"detail": "You do not have a store yet."}, status=status.HTTP_404_NOT_FOUND)
        serializer = StoreSerializer(
            store, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class PublicStoreListView(APIView):
    """List all stores (public)."""

    permission_classes = [AllowAny]
    serializer_class = StorePublicSerializer

    @extend_schema(responses={200: StorePublicSerializer(many=True)})
    def get(self, request):
        stores = Store.objects.select_related("seller").all()
        serializer = StorePublicSerializer(stores, many=True)
        return Response(serializer.data)


class PublicStoreDetailView(APIView):
    """Retrieve a single store by ID (public)."""

    permission_classes = [AllowAny]
    serializer_class = StorePublicSerializer

    @extend_schema(responses={200: StorePublicSerializer})
    def get(self, request, pk):
        store = get_object_or_404(Store.objects.select_related("seller"), pk=pk)
        return Response(StorePublicSerializer(store).data)
