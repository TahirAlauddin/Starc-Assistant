from django.contrib import admin
from .models import TrainingFile, Training, Machine

admin.site.register((TrainingFile, Training, Machine))
