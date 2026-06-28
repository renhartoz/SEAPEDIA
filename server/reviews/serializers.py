from rest_framework import serializers
from .models import AppReview


class AppReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppReview
        fields = ["id", "reviewer_name", "rating", "comment", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value

    def validate_reviewer_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Reviewer name cannot be blank.")
        return value.strip()

    def validate_comment(self, value):
        if not value.strip():
            raise serializers.ValidationError("Comment cannot be blank.")
        return value.strip()
