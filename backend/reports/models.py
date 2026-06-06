from django.db import models
from django.conf import settings


class Report(models.Model):
    class CropType(models.TextChoices):
        BANANA = 'banana', 'Banana'
        COFFEE = 'coffee', 'Coffee'

    class Severity(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        REVIEWED = 'reviewed', 'Reviewed'
        RESOLVED = 'resolved', 'Resolved'

    class Disease(models.TextChoices):
        # Banana
        BANANA_BACTERIAL_WILT = 'banana_bacterial_wilt', 'Banana Bacterial Wilt'
        BLACK_SIGATOKA = 'black_sigatoka', 'Black Sigatoka'
        FUSARIUM_WILT = 'fusarium_wilt', 'Fusarium Wilt'
        # Coffee
        COFFEE_LEAF_RUST = 'coffee_leaf_rust', 'Coffee Leaf Rust'
        COFFEE_BERRY_DISEASE = 'coffee_berry_disease', 'Coffee Berry Disease'
        COFFEE_WILT_DISEASE = 'coffee_wilt_disease', 'Coffee Wilt Disease'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name='reports'
    )
    farmer_name = models.CharField(max_length=255)
    contact_info = models.CharField(max_length=20)
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    crop_type = models.CharField(max_length=10, choices=CropType.choices)
    symptoms = models.JSONField(default=dict)
    comments = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='reports/', null=True, blank=True)
    disease = models.CharField(
        max_length=50, choices=Disease.choices, null=True, blank=True
    )
    severity = models.CharField(
        max_length=10, choices=Severity.choices, null=True, blank=True
    )
    confidence = models.FloatField(null=True, blank=True)
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.crop_type} report #{self.id} - {self.get_disease_display() or 'Pending'}"


class Advisory(models.Model):
    report = models.OneToOneField(
        Report, on_delete=models.CASCADE, related_name='advisory'
    )
    disease_name = models.CharField(max_length=100)
    description = models.TextField()
    severity = models.CharField(max_length=10, choices=Report.Severity.choices)
    treatment = models.JSONField(default=list)
    prevention = models.JSONField(default=list)
    best_practices = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Advisory for Report #{self.report.id}"
