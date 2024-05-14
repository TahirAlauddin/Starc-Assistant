from django.contrib import admin
from .models import TrainingFile, Training, Machine, Department

admin.site.register((TrainingFile, Training, Machine))

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
