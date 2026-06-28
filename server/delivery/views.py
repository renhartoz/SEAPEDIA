from decimal import Decimal
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Sum
from django.utils import timezone
from core.permissions import IsActiveDriver
from orders.models import Order, OrderStatusHistory
from .models import DeliveryJob
from .serializers import DeliveryJobSerializer, DriverEarningsSerializer
from drf_spectacular.utils import extend_schema


class DriverJobListView(APIView):
    """List available delivery jobs (order status = Menunggu Pengirim)."""

    permission_classes = [IsActiveDriver]
    serializer_class = DeliveryJobSerializer

    @extend_schema(responses={200: DeliveryJobSerializer(many=True)})
    def get(self, request):
        jobs = DeliveryJob.objects.filter(status="available").select_related("order__store", "order__buyer")
        return Response(DeliveryJobSerializer(jobs, many=True).data)


class DriverJobDetailView(APIView):
    """Get detail of a delivery job."""

    permission_classes = [IsActiveDriver]
    serializer_class = DeliveryJobSerializer

    @extend_schema(responses={200: DeliveryJobSerializer})
    def get(self, request, pk):
        job = get_object_or_404(
            DeliveryJob.objects.select_related("order__store", "order__buyer", "driver"),
            pk=pk,
        )
        return Response(DeliveryJobSerializer(job).data)


class DriverTakeJobView(APIView):
    """Driver takes an available job — atomic + select_for_update."""

    permission_classes = [IsActiveDriver]
    serializer_class = DeliveryJobSerializer

    @extend_schema(request=None, responses={200: DeliveryJobSerializer})
    def post(self, request, pk):
        with transaction.atomic():
            job = get_object_or_404(DeliveryJob.objects.select_for_update(), pk=pk)

            if job.driver is not None:
                return Response(
                    {"error": {"code": "job_taken", "message": "This job has already been taken."}},
                    status=status.HTTP_409_CONFLICT,
                )

            if job.status != "available":
                return Response(
                    {"error": {"code": "job_not_available", "message": "Job is not available."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            job.driver = request.user
            job.status = "taken"
            job.taken_at = timezone.now()
            job.driver_earnings = (job.order.delivery_fee * Decimal("0.20")).quantize(Decimal("0.01"))
            job.save()

            order = job.order
            order.status = "Sedang Dikirim"
            order.save(update_fields=["status"])
            OrderStatusHistory.objects.create(
                order=order, status="Sedang Dikirim", actor=request.user
            )

        return Response(DeliveryJobSerializer(job).data)


class DriverCompleteJobView(APIView):
    """Driver marks job as completed → order Pesanan Selesai."""

    permission_classes = [IsActiveDriver]
    serializer_class = DeliveryJobSerializer

    @extend_schema(request=None, responses={200: DeliveryJobSerializer})
    def post(self, request, pk):
        with transaction.atomic():
            job = get_object_or_404(DeliveryJob.objects.select_for_update(), pk=pk, driver=request.user)

            if job.status != "taken":
                return Response(
                    {"error": {"code": "invalid_status", "message": "Job is not in taken status."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            job.status = "completed"
            job.completed_at = timezone.now()
            job.save()

            order = job.order
            order.status = "Pesanan Selesai"
            order.save(update_fields=["status"])
            OrderStatusHistory.objects.create(
                order=order, status="Pesanan Selesai", actor=request.user
            )

        return Response(DeliveryJobSerializer(job).data)


class DriverJobHistoryView(APIView):
    """Driver's past completed jobs."""

    permission_classes = [IsActiveDriver]
    serializer_class = DeliveryJobSerializer

    @extend_schema(responses={200: DeliveryJobSerializer(many=True)})
    def get(self, request):
        jobs = DeliveryJob.objects.filter(
            driver=request.user, status="completed"
        ).select_related("order__store", "order__buyer")
        return Response(DeliveryJobSerializer(jobs, many=True).data)


class DriverEarningsView(APIView):
    """Driver earnings summary."""

    permission_classes = [IsActiveDriver]
    serializer_class = DriverEarningsSerializer

    @extend_schema(responses={200: DriverEarningsSerializer})
    def get(self, request):
        jobs = DeliveryJob.objects.filter(driver=request.user)
        completed = jobs.filter(status="completed")
        total = completed.aggregate(total=Sum("driver_earnings"))["total"] or Decimal("0")
        return Response(
            {
                "total_jobs": jobs.count(),
                "completed_jobs": completed.count(),
                "total_earnings": total,
            }
        )
