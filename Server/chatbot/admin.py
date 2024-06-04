from django.contrib import admin
from .models import TrainingFile, Training, Machine, Department, Topic, Answer, Question

admin.site.register((TrainingFile, Training, Machine, Topic, Answer, Question))

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
