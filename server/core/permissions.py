from rest_framework.permissions import BasePermission


class IsActiveSeller(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.auth
            and request.auth.get("active_role") == "seller"
        )


class IsActiveBuyer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.auth
            and request.auth.get("active_role") == "buyer"
        )


class IsActiveDriver(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.auth
            and request.auth.get("active_role") == "driver"
        )


class IsActiveAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.auth
            and request.auth.get("active_role") == "admin"
        )
