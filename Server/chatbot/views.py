from django.db import transaction
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout

from rest_framework import status, viewsets, filters
from rest_framework.decorators import api_view
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Department, Question, Machine, Answer, Topic, Training, 
    TrainingFile, TopicFile
)
from .serializers import (
    DepartmentSerializer, QuestionSerializer, MachineSerializer, 
    AnswerSerializer, TopicSerializer, TrainingSerializer, 
    TrainingFileSerializer, TopicFileSerializer, TrainingListSerializer
)

import threading
import json

from .incremental import chatbot 
from .chatbot_utils import * 

model_path = "chatbot/incremental/finalmodel.joblib"
intents_path = "chatbot/incremental/intents.json"
is_training_in_progress = False
model = intents = None

model, intents = chatbot.load_model(model_path, intents_path)


def train_model_task(model_path, intents_path):
    global is_training_in_progress
    try:
        create_intents_file(intents_path)
        train.train_model(model_path, intents_path)
    finally:
        # Reset the flag when training is complete
        is_training_in_progress = False
        # Make sure to reload the model to use the latest one
        reload_model()


def reload_model():
    global model, intents 
    model, intents = chatbot.load_model(model_path, intents_path)


# Custom Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'  # Allow client to override the page size
    max_page_size = 100  # Maximum limit for page size


# Ali's code for retraining model
def retrain_model(request):
    global is_training_in_progress
    if is_training_in_progress:
        # Return response if training is already in progress
        return JsonResponse({"message": "Model Training is already in progress. Please do not click again!"}, status=409)
    
    # Set the flag to True to indicate training is starting
    is_training_in_progress = True
    thread = threading.Thread(target=train_model_task, args=(model_path, intents_path,), daemon=True)
    thread.start()
    return JsonResponse({"message": "Model Training Started Successfully"}, status=200)


@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        username = data.get('username')
        password = data.get('password')

        # If user is valid and superuser
        if user := authenticate(request, username=username, password=password):
            if user.is_superuser:
                auth_login(request, user)
                return JsonResponse({'isAdmin': True})
        return JsonResponse({'isAdmin': False})

    return JsonResponse({'error': 'method not allowed'})


@csrf_exempt
def logout_view(request):
    auth_logout(request)
    return JsonResponse({'status': 'success'})


@csrf_exempt
def chatbot_model_view(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        query = data.get('query')
        answer, tag = chatbot.get_answer(model, query, intents)
        print(tag, "LINE 77")
        files = None
        if tag:
            files = TopicFile.objects.filter(topic__label=tag).values_list('file', flat=True)
        if files:
            files = list(files)
        else: 
            return  JsonResponse({'response': answer, 'files': None})
        print(files, answer)
        return JsonResponse({'response': answer, 'files': files})
    return JsonResponse({'response': 'ERROR OCCURED'})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    # queryset = Question.objects.all()
    model = Question
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['text', 'topic']
    search_fields = ['text', 'topic']
    ordering_fields = ['text', 'topic'] 
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        query = Question.objects.prefetch_related('topic').filter(topic_id=self.kwargs['topic_pk'])
        return query


class MachineViewSet(viewsets.ModelViewSet):
    serializer_class = MachineSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'department__name']
    search_fields = ['name', 'department__name']
    ordering_fields = ['name', 'department__name'] 
    # ordering = ['answer']  # Default ordering
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Machine.objects.select_related('department').all()


class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['text', 'topic']
    search_fields = ['text', 'topic']
    ordering_fields = ['text', 'topic'] 
    # ordering = ['answer']  # Default ordering
    pagination_class = StandardResultsSetPagination
    
    def get_queryset(self):
        related_manager = Answer.objects
        if self.kwargs.get('topic_pk'):
            # It means, this viewset is being used by Nested Router
            related_manager =  related_manager.filter(topic_id=self.kwargs['topic_pk'])
            
        query = related_manager.all()
        return query
    

class TopicViewSet(viewsets.ModelViewSet):
    # queryset = Topic.objects.select_related('machine').prefetch_related('questions', 'answers').all()
    serializer_class = TopicSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['label', 'machine__department']  # Assuming you have these fields
    search_fields = ['label']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Topic.objects.select_related('machine').prefetch_related('questions', 'answers').all()


class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['title', 'content', 'category__id']  
    search_fields = ['title', 'content', 'category__name']
    ordering_fields = ['id', 'title'] 
    # ordering = ['name']  # Default ordering
    pagination_class = StandardResultsSetPagination    


class BulkTopicFilesAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, topic_pk, *args, **kwargs):
        # Get the topic instance based on topic_pk, handle not found
        topic = self.get_topic_instance(topic_pk)
        if topic is None:
            return JsonResponse({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        added_files = request.FILES.getlist('addedFiles')
        removed_files_ids = request.data.getlist('removedFiles')

        # Handle added files
        for file in added_files:
            # TODO: Adjust the creation logic as needed for your model
            TopicFile.objects.create(file=file, topic=topic)

        # Handle removed files
        TopicFile.objects.filter(id__in=removed_files_ids).delete()

        # Return a success response
        return JsonResponse({'message': 'Files updated successfully'}, status=status.HTTP_200_OK)

    def get_topic_instance(self, topic_pk):
        try:
            return Topic.objects.get(pk=topic_pk)
        except Topic.DoesNotExist:
            return None



class BulkTrainingFilesAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, training_pk, *args, **kwargs):
        # Get the training instance based on training_pk, handle not found
        training = self.get_training_instance(training_pk)
        if training is None:
            return JsonResponse({'error': 'Training not found'}, status=status.HTTP_404_NOT_FOUND)

        added_files = request.FILES.getlist('addedFiles')
        removed_files_ids = request.data.getlist('removedFiles')

        # Handle added files
        for file in added_files:
            # TODO: Adjust the creation logic as needed for your model
            TrainingFile.objects.create(file=file, training=training)

        # Handle removed files
        TrainingFile.objects.filter(id__in=removed_files_ids).delete()

        # Return a success response
        return JsonResponse({'message': 'Files updated successfully'}, status=status.HTTP_200_OK)

    def get_training_instance(self, training_pk):
        try:
            return Training.objects.get(pk=training_pk)
        except Training.DoesNotExist:
            return None


class TrainingFileViewSet(viewsets.ModelViewSet):
    serializer_class = TrainingFileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['training']  # Assuming you have these fields
    search_fields = ['training']
    ordering_fields = ['training']  
    # ordering = ['name']  # Default ordering
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        queryset = TrainingFile.objects.all()
        training_pk = self.kwargs.get('training_pk')  # Retrieve the order_pk from the URL parameters

        if training_pk is not None:
            queryset = queryset.filter(training__pk=training_pk)  # Filter the queryset by order_pk
        
        return queryset 


class TopicFileViewSet(viewsets.ModelViewSet):
    serializer_class = TopicFileSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['topic']
    ordering_fields = ['topic']
    filterset_fields = ['topic']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        if self.kwargs.get('topic_pk'):
            query = TopicFile.objects.filter(topic__id=self.kwargs['topic_pk'])
            return query
        return TopicFile.objects.all()



@api_view(['GET'])
def get_training_file(request):
    """
    Custom action to retrieve all training objects with an optional associated training file.
    Each training object will have a 'file' attribute 
    that will return the file of the associated TrainingFile, or 'default.jpg' if none exists.
    """
    query = request.query_params.get('search', None)
    if query is not None:
        trainings = Training.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query) | Q(category__name__icontains=query)
        )
    else:
        trainings = Training.objects.all()

    # Set up pagination
    paginator = StandardResultsSetPagination()
    page = paginator.paginate_queryset(trainings, request)
    if page is not None:
        # Serialize the data for the current page
        serializer = TrainingListSerializer(page, many=True, context={'request': request})
        # Return the paginated response
        return paginator.get_paginated_response(serializer.data)

    # Serialize the data. Ensure your serializer can handle the 'thumbnail' field properly.
    serializer = TrainingListSerializer(trainings, many=True, context={'request': request})

    # Return the response
    return Response(serializer.data)



@api_view(['GET'])
def get_training_count(request):
    # Fetch all Training objects
    query = request.query_params.get('search', None)
    if query is not None:
        trainings = Training.objects.filter(
            Q(title__icontains=query) | Q(content__icontains=query) | Q(category__name__icontains=query)
        )
        count = trainings.count()
    else:
        count = Training.objects.count()
    
    # Return the response
    return Response({'count': count})


@api_view(['GET'])
def check_training_status(request):
    if is_training_in_progress:
        return JsonResponse({"message": "Model Training is already in progress. Please do not click again!"}, status=200)
    
    return JsonResponse({"is_trained": "Model is Trained"}, status=200)
    

@api_view(('POST', 'PUT'))
@csrf_exempt
def upload_data(request):
    data = json.loads(request.body)
    questions = data.get('questions')
    answers = data.get('answers')
    label = data.get('label')
    machine = data.get('machine')
    
    if request.method == 'POST':

        if not label:
            return Response({'error': 'Question and Topic not provided'}, status=status.HTTP_400_BAD_REQUEST)
        # Check if the label already exists in the database
        existing_topic = Topic.objects.filter(label=label).first()
        if existing_topic:
            return Response({'error': 'Topic label already exists', 
                            'topic': {'id': existing_topic.id, 
                                    'machine_id': existing_topic.machine.id
                                    }},
                            status=status.HTTP_409_CONFLICT)
        else:
            # Create a new topic since it doesn't exist
            existing_machine_instance = Machine.objects.filter(name__iexact=machine).first()
            new_topic = Topic.objects.create(label=label, machine=existing_machine_instance)
            if questions and answers:
                for question in questions:
                    Question.objects.create(text=question, topic=new_topic)
                for answer in answers:
                    Answer.objects.create(text=answer, topic=new_topic)
                
                
                print("Topic should be added to model")
                threading.Thread(target=addTopicToModel, args=(questions, new_topic,
                                                            answers, model_path,
                                                            intents_path)).start()
                print("Topic was added to model")
        
            return Response({'message': 'Topic created successfully', 
                            'topic': {'id': new_topic.id, 
                                    'machine_id': existing_machine_instance.id
                                    }},
                            status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # Begin transaction to ensure atomic updates
        existing_topic = Topic.objects.filter(label=label).first()
        
        with transaction.atomic():
            topic = Topic.objects.filter(label=label).first()
            if topic:
                # Attempt to find or create the new machine
                machine, created = Machine.objects.get_or_create(name=machine)
                topic.machine = machine
                
                # Delete existing questions and answers
                Question.objects.filter(topic=topic).delete()
                Answer.objects.filter(topic=topic).delete()
                
                # Add new questions and answers
                if questions and answers:
                    for question in questions:
                        Question.objects.create(text=question, topic=topic)
                    for answer in answers:
                        Answer.objects.create(text=answer, topic=topic)
                
                # Save any changes made to the topic itself
                topic.save()
                
                return JsonResponse({'status': 'updated', 'topic': {'id': topic.id}}, status=200)
            else:
                return JsonResponse({'status': 'topic not found'}, status=404)

    else:
        Response({'error': 'Method not allowed'},
                  status.HTTP_405_METHOD_NOT_ALLOWED)


class TopicFileBulkView(APIView):
    def post(self, request, *args, **kwargs):
        topic_id = request.data.get('topicId')
        files = request.FILES.getlist('files')

        if not topic_id:
            return Response({'error': 'Missing topic ID'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            topic = Topic.objects.get(id=topic_id)
        except Topic.DoesNotExist:
            return Response({'error': 'Topic not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            with transaction.atomic():
                for file in files:
                    serializer = TopicFileSerializer(data={'topic': topic.id, 'file': file})
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        # If any file fails to save, a rollback is triggered
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Handle unexpected errors
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'Files uploaded successfully'}, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        file_ids = request.data.get('file_ids')  # Expect a list of file IDs to delete

        if not file_ids:
            return Response({'error': 'No file IDs provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Delete files by ID
        TopicFile.objects.filter(id__in=file_ids).delete()

        return Response({'message': 'Files deleted successfully'}, status=status.HTTP_204_NO_CONTENT)

 
@api_view(['GET'])
def get_machine_count(request):
    # Fetch all Machine objects
    count = Machine.objects.count()
    # Return the response
    return Response({'count': count})    

