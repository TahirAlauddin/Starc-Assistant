from rest_framework import serializers
from .models import (Department, Question, 
                    Machine, Answer, Topic,
                    Training, TrainingFile,
                    TopicFile)
from rest_framework_nested.relations import NestedHyperlinkedRelatedField
from django.core.files.base import ContentFile
from rest_framework import serializers


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class MachineSerializer(serializers.ModelSerializer):
    department = serializers.CharField()
    class Meta:
        model = Machine
        fields = ['id', 'name', 'department']
        
    def create(self, validated_data):
        # Extract the department name from validated data
        department_name = validated_data.pop('department', None)
        # Get or create the department based on the name
        department, created = Department.objects.get_or_create(name=department_name)
        # Create the Machine instance with the department
        machine = Machine.objects.create(department=department, **validated_data)
        
        return machine
    
    def update(self, instance, validated_data):
        # Extract the department name and remove it from validated_data if present
        department_name = validated_data.pop('department', None)
        
        # Update the department if a new name is provided
        if department_name and department_name != instance.department.name:
            department, created = Department.objects.get_or_create(name=department_name)
            instance.department = department
        
        # Update other fields of Machine
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
        
        

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = '__all__'


class QuestionForTopicsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['text']


class AnswerForTopicsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ['text']


class TopicSerializer(serializers.ModelSerializer):
    questions = QuestionForTopicsSerializer(many=True, read_only=True)
    answers = AnswerForTopicsSerializer(many=True, read_only=True)
    class Meta:
        model = Topic
        fields = ['id', 'label', 'questions', 'answers', 'machine', 'isTrained']


class TopicFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TopicFile
        fields = '__all__'

    def validate(self, attrs):
        attrs = super().validate(attrs)  # Keep the base validation

        # Your custom file name length validation
        file_field = attrs.get('file', None)
        if file_field and len(file_field.name) > 100:
            extension = file_field.name.rsplit('.', 1)[-1]
            new_name = file_field.name[:100 - len(extension) - 1]  # account for the dot
            new_name = f"{new_name}.{extension}"
            attrs['file'] = ContentFile(file_field.read(), name=new_name)

        return attrs


# TODO: Remember to handle any potential name collisions and test this method thoroughly.
# Training View Page
class TrainingSerializer(serializers.ModelSerializer):
    files = NestedHyperlinkedRelatedField(view_name='training-files-detail',
                                        many=True,
                                        parent_lookup_kwargs={'training_pk': 'training__pk'},
                                        read_only=True)
    class Meta:
        model = Training
        fields = ['id', 'title', 'content', 'files', 'category']

class TrainingFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingFile
        fields = '__all__'



# Training List Page
class TrainingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = ['id', 'title', 'content', 'file', "category"]

    file = serializers.SerializerMethodField(read_only=True)


    def get_file(self, obj):
         # Try to get an associated TrainingFile, if none, use 'default.jpg'
        training_file = TrainingFile.objects.filter(training=obj).first()
        if training_file:
            return training_file.file.url  # Assuming 'file' is a FileField
        else:
            return '/static/images/default.png'


class TrainingListFileSerializer(serializers.ModelSerializer):
    training = TrainingListSerializer()
    class Meta:
        model = TrainingFile
        fields = ['id', 'training', 'file']
