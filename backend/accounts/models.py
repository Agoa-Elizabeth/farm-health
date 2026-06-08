from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        FARMER = 'farmer', 'Farmer'
        ADMIN = 'admin', 'Administrator'

    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.FARMER)

    REQUIRED_FIELDS = ['phone_number']

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.phone_number})"
