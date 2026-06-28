from rest_framework import serializers

class AdminStatsSerializer(serializers.Serializer):
    users = serializers.IntegerField()
    stores = serializers.IntegerField()
    products = serializers.IntegerField()
    orders = serializers.IntegerField()
    delivery_jobs = serializers.IntegerField()
    vouchers = serializers.IntegerField()
    promos = serializers.IntegerField()

class AdminSimulateNextDayResponseSerializer(serializers.Serializer):
    processed_count = serializers.IntegerField()
    processed_order_ids = serializers.ListField(
        child=serializers.UUIDField()
    )
