from rest_framework import serializers
from .models import Department, Question, Machine, Answer, Topic, Training


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class MachineSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        write_only=True
    )

    class Meta:
        model = Machine
        fields = ['id', 'name', 'department', 'department_name']

    def create(self, validated_data):
        # Pop department as it's expecting a Department instance, not a name
        machine = Machine.objects.create(**validated_data)
        return machine

    def update(self, instance, validated_data):
        department = validated_data.pop('department', None)
        instance.name = validated_data.get('name', instance.name)
        if department:
            instance.department = department
        instance.save()
        return instance


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'

class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = '__all__'

class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = '__all__'
