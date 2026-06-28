from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.permissions import IsActiveAdmin
from accounts.models import User
from stores.models import Store
from catalog.models import Product
from orders.models import Order
from discounts.models import Voucher, Promo
from discounts.serializers import VoucherSerializer, VoucherCreateSerializer, PromoSerializer, PromoCreateSerializer
from delivery.models import DeliveryJob
from django.shortcuts import get_object_or_404
from .overdue import process_overdue_orders, SLA_DAYS
from django.utils import timezone
from .serializers import AdminStatsSerializer, AdminSimulateNextDayResponseSerializer
from drf_spectacular.utils import extend_schema


class AdminStatsView(APIView):
    """High-level platform statistics."""

    permission_classes = [IsActiveAdmin]
    serializer_class = AdminStatsSerializer

    def get(self, request):
        return Response(
            {
                "users": User.objects.count(),
                "stores": Store.objects.count(),
                "products": Product.objects.count(),
                "orders": Order.objects.count(),
                "delivery_jobs": DeliveryJob.objects.count(),
                "vouchers": Voucher.objects.count(),
                "promos": Promo.objects.count(),
            }
        )


class AdminUserListView(APIView):
    """Admin: list all users with their roles."""

    permission_classes = [IsActiveAdmin]

    @property
    def serializer_class(self):
        from accounts.serializers import UserProfileSerializer
        return UserProfileSerializer

    def get(self, request):
        from accounts.serializers import UserProfileSerializer
        users = User.objects.prefetch_related("user_roles").all()
        return Response(UserProfileSerializer(users, many=True).data)


class AdminStoreListView(APIView):
    """Admin: list all stores."""

    permission_classes = [IsActiveAdmin]

    @property
    def serializer_class(self):
        from stores.serializers import StorePublicSerializer
        return StorePublicSerializer

    def get(self, request):
        from stores.serializers import StorePublicSerializer
        return Response(StorePublicSerializer(Store.objects.select_related("seller").all(), many=True).data)


class AdminProductListView(APIView):
    """Admin: list all products."""

    permission_classes = [IsActiveAdmin]

    @property
    def serializer_class(self):
        from catalog.serializers import ProductPublicSerializer
        return ProductPublicSerializer

    def get(self, request):
        from catalog.serializers import ProductPublicSerializer
        return Response(ProductPublicSerializer(Product.objects.select_related("store").all(), many=True).data)


class AdminOrderListView(APIView):
    """Admin: list all orders."""

    permission_classes = [IsActiveAdmin]

    @property
    def serializer_class(self):
        from orders.serializers import OrderSerializer
        return OrderSerializer

    def get(self, request):
        from orders.serializers import OrderSerializer
        orders = Order.objects.select_related("buyer", "store").all()
        return Response(OrderSerializer(orders, many=True).data)


class AdminVoucherListView(APIView):
    """Admin: list all vouchers and create new ones."""

    permission_classes = [IsActiveAdmin]
    serializer_class = VoucherSerializer

    @extend_schema(operation_id="admin_vouchers_list", responses={200: VoucherSerializer(many=True)})
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

    @extend_schema(operation_id="admin_vouchers_retrieve", responses={200: VoucherSerializer})
    def get(self, request, pk):
        return Response(VoucherSerializer(get_object_or_404(Voucher, pk=pk)).data)


class AdminPromoListView(APIView):
    """Admin: list all promos and create new ones."""

    permission_classes = [IsActiveAdmin]
    serializer_class = PromoSerializer

    @extend_schema(operation_id="admin_promos_list", responses={200: PromoSerializer(many=True)})
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

    @extend_schema(operation_id="admin_promos_retrieve", responses={200: PromoSerializer})
    def get(self, request, pk):
        return Response(PromoSerializer(get_object_or_404(Promo, pk=pk)).data)


class AdminJobListView(APIView):
    """Admin: list all delivery jobs."""

    permission_classes = [IsActiveAdmin]

    @property
    def serializer_class(self):
        from delivery.serializers import DeliveryJobSerializer
        return DeliveryJobSerializer

    def get(self, request):
        from delivery.serializers import DeliveryJobSerializer
        jobs = DeliveryJob.objects.select_related("order__store", "order__buyer", "driver").all()
        return Response(DeliveryJobSerializer(jobs, many=True).data)


class AdminOverdueOrdersView(APIView):
    """Admin: list orders that have breached their SLA."""

    permission_classes = [IsActiveAdmin]

    @property
    def serializer_class(self):
        from orders.serializers import OrderSerializer
        return OrderSerializer

    def get(self, request):
        from orders.serializers import OrderSerializer
        from datetime import timedelta

        now = timezone.now()
        overdue = []

        for job in DeliveryJob.objects.filter(status="taken").select_related("order"):
            sla = SLA_DAYS.get(job.order.delivery_method, 5)
            if job.taken_at and now > job.taken_at + timedelta(days=sla):
                overdue.append(job.order)

        return Response(OrderSerializer(overdue, many=True).data)


class AdminSimulateNextDayView(APIView):
    """Admin: trigger overdue order processing (simulates day advancement)."""

    permission_classes = [IsActiveAdmin]
    serializer_class = AdminSimulateNextDayResponseSerializer

    @extend_schema(request=None, responses={200: AdminSimulateNextDayResponseSerializer})
    def post(self, request):
        processed_ids = process_overdue_orders()
        return Response(
            {
                "processed_count": len(processed_ids),
                "processed_order_ids": processed_ids,
            }
        )
