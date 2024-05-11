from django.contrib import admin
from .models import TrainingFile, Training, Machine, MachineList, Department

admin.site.register((TrainingFile, Training, Machine))

@admin.register(MachineList)
class MachineAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'department', 'added_date')
    list_filter = ('department',)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
