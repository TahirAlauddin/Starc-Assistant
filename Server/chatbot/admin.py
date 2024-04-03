from django.contrib import admin


from .models import TrainingFile, Training

admin.site.register((TrainingFile, Training))