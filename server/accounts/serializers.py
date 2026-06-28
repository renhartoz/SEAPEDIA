from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import UserRole, DeliveryAddress

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        roles = user.role_list()
        token["roles"] = roles
        token["active_role"] = "admin" if "admin" in roles else (roles[0] if roles else None)
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        roles = self.user.role_list()
        data["roles"] = roles
        data["active_role"] = self.get_token(self.user)["active_role"]
        data["user"] = UserProfileSerializer(self.user).data
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    roles = serializers.MultipleChoiceField(
        choices=UserRole.ROLE_CHOICES,
        required=True,
    )

    class Meta:
        model = User
        fields = ["username", "email", "password", "phone", "roles"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate_roles(self, value):
        if not value:
            raise serializers.ValidationError("At least one role must be selected.")
        if "admin" in value and len(value) > 1:
            raise serializers.ValidationError("Admin role cannot be combined with other roles.")
        return value

    def create(self, validated_data):
        roles = validated_data.pop("roles")
        user = User.objects.create_user(**validated_data)
        for role in roles:
            UserRole.objects.create(user=user, role=role)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    roles = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "phone", "roles", "date_joined"]

    def get_roles(self, obj) -> list[str]:
        return obj.role_list()


class RoleSwitchSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=UserRole.ROLE_CHOICES)

    def validate_role(self, value):
        user = self.context["request"].user
        if not user.user_roles.filter(role=value).exists():
            raise serializers.ValidationError("You do not own this role.")
        return value


class RoleSwitchResponseSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    access = serializers.CharField()
    active_role = serializers.CharField()
    roles = serializers.ListField(child=serializers.CharField())


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class DeliveryAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryAddress
        fields = [
            "id", "label", "recipient_name", "phone",
            "street", "city", "province", "postal_code", "is_default", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
