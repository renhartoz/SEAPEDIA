from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from core.pagination import StandardPagination
from .models import AppReview
from .serializers import AppReviewSerializer
from drf_spectacular.utils import extend_schema


class AppReviewListView(APIView):
    """List all app reviews"""

    permission_classes = [AllowAny]
    serializer_class = AppReviewSerializer

    @extend_schema(responses={200: AppReviewSerializer(many=True)})
    def get(self, request):
        reviews = AppReview.objects.all()
        paginator = StandardPagination()
        page = paginator.paginate_queryset(reviews, request)
        serializer = AppReviewSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AppReviewCreateView(APIView):
    """Submit a new app review"""

    permission_classes = [AllowAny]
    serializer_class = AppReviewSerializer

    @extend_schema(request=AppReviewSerializer, responses={201: AppReviewSerializer})
    def post(self, request):
        serializer = AppReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(AppReviewSerializer(review).data, status=status.HTTP_201_CREATED)
