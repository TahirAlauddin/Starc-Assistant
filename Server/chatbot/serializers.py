from rest_framework import serializers
from .models import (Department, Question, 
                    Machine, Answer, Topic,
                    Training, TrainingFile,
                    TopicFile,MachineList)
from rest_framework_nested.relations import NestedHyperlinkedRelatedField
from django.core.files.base import ContentFile
from rest_framework import serializers


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

class MachineListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    added_date = serializers.DateTimeField(read_only=True)

    class Meta:
        model = MachineList
        fields = ['id', 'name', 'department_name', 'added_date'] 
       


        