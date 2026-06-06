from rest_framework import serializers
from .models import Report, Advisory


class ReportListSerializer(serializers.ModelSerializer):
    disease_display = serializers.SerializerMethodField()
    severity_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    crop_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'crop_type', 'crop_type_display', 'disease', 'disease_display',
            'severity', 'severity_display', 'status', 'status_display',
            'farmer_name', 'location', 'created_at',
        ]

    def get_disease_display(self, obj):
        return obj.get_disease_display() if obj.disease else None

    def get_severity_display(self, obj):
        return obj.get_severity_display() if obj.severity else None

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_crop_type_display(self, obj):
        return obj.get_crop_type_display()


class AdvisorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Advisory
        fields = '__all__'


class ReportDetailSerializer(serializers.ModelSerializer):
    advisory = AdvisorySerializer(read_only=True)
    disease_display = serializers.SerializerMethodField()
    severity_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    crop_type_display = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'user', 'farmer_name', 'contact_info', 'location',
            'latitude', 'longitude', 'crop_type', 'crop_type_display',
            'symptoms', 'comments', 'image',
            'disease', 'disease_display', 'severity', 'severity_display',
            'confidence', 'status', 'status_display',
            'created_at', 'updated_at', 'advisory',
        ]
        read_only_fields = ['user', 'disease', 'severity', 'confidence', 'status', 'advisory']

    def get_disease_display(self, obj):
        return obj.get_disease_display() if obj.disease else None

    def get_severity_display(self, obj):
        return obj.get_severity_display() if obj.severity else None

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_crop_type_display(self, obj):
        return obj.get_crop_type_display()


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'farmer_name', 'contact_info', 'location', 'latitude', 'longitude',
            'crop_type', 'symptoms', 'comments', 'image',
        ]

    def validate_image(self, value):
        if value:
            valid_types = ['image/jpeg', 'image/png', 'image/jpg']
            if hasattr(value, 'content_type') and value.content_type not in valid_types:
                raise serializers.ValidationError(
                    "Only JPG, JPEG, and PNG images are allowed"
                )
            if value.size > 16 * 1024 * 1024:
                raise serializers.ValidationError("Image size must be less than 16MB")
        return value

    def validate_symptoms(self, value):
        if not isinstance(value, dict) or not any(value.values()):
            raise serializers.ValidationError("At least one symptom must be selected")
        return value


class ReportStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['status']
