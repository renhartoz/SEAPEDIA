from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from drf_spectacular.utils import extend_schema
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    RoleSwitchSerializer,
    RoleSwitchResponseSerializer,
    LogoutSerializer,
    CustomTokenObtainPairSerializer,
    DeliveryAddressSerializer,
)
from .models import DeliveryAddress
from core.permissions import IsActiveBuyer


class RegisterView(APIView):
    """Register a new user"""

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    @extend_schema(request=RegisterSerializer, responses={201: UserProfileSerializer})
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserProfileSerializer(user).data, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Obtain JWT token pair"""

    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    @extend_schema(request=CustomTokenObtainPairSerializer, responses={200: CustomTokenObtainPairSerializer})
    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class LogoutView(APIView):
    """Blacklist the refresh token"""

    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    @extend_schema(request=LogoutSerializer, responses={204: None})
    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"error": {"code": "bad_request", "message": "refresh token required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"error": {"code": "bad_request", "message": "invalid or expired token"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class RoleSwitchView(APIView):
    """Issue a new token pair with a different active_role"""

    permission_classes = [IsAuthenticated]
    serializer_class = RoleSwitchSerializer

    @extend_schema(request=RoleSwitchSerializer, responses={200: RoleSwitchResponseSerializer})
    def post(self, request):
        serializer = RoleSwitchSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        role = serializer.validated_data["role"]

        refresh = RefreshToken.for_user(request.user)
        roles = request.user.role_list()
        refresh["roles"] = roles
        refresh["active_role"] = role

        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "active_role": role,
                "roles": roles,
            }
        )


class MeView(APIView):
    """Current authenticated user profile"""

    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    @extend_schema(responses={200: UserProfileSerializer})
    def get(self, request):
        active_role = request.auth.get("active_role") if request.auth else None
        data = UserProfileSerializer(request.user).data
        data["active_role"] = active_role
        return Response(data)


class AddressListCreateView(APIView):
    """List or create delivery addresses for the active buyer."""

    permission_classes = [IsActiveBuyer]
    serializer_class = DeliveryAddressSerializer

    @extend_schema(responses={200: DeliveryAddressSerializer(many=True)})
    def get(self, request):
        addresses = request.user.addresses.all()
        return Response(DeliveryAddressSerializer(addresses, many=True).data)

    @extend_schema(request=DeliveryAddressSerializer, responses={201: DeliveryAddressSerializer})
    def post(self, request):
        serializer = DeliveryAddressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_default"):
            request.user.addresses.filter(is_default=True).update(is_default=False)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AddressDetailView(APIView):
    """Retrieve, update, or delete a specific delivery address."""

    permission_classes = [IsActiveBuyer]
    serializer_class = DeliveryAddressSerializer

    def _get_address(self, request, pk):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(DeliveryAddress, pk=pk, user=request.user)

    @extend_schema(responses={200: DeliveryAddressSerializer})
    def get(self, request, pk):
        return Response(DeliveryAddressSerializer(self._get_address(request, pk)).data)

    @extend_schema(request=DeliveryAddressSerializer, responses={200: DeliveryAddressSerializer})
    def patch(self, request, pk):
        address = self._get_address(request, pk)
        serializer = DeliveryAddressSerializer(address, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_default"):
            request.user.addresses.filter(is_default=True).update(is_default=False)
        serializer.save()
        return Response(serializer.data)

    @extend_schema(responses={204: None})
    def delete(self, request, pk):
        self._get_address(request, pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
