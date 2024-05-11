from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.db import transaction 
from rest_framework import status
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.contrib.auth import (authenticate,
                                login as auth_login, 
                                logout as auth_logout)
from .models import (Department, Question, Machine,
                     Answer, Topic, Training, TrainingFile,
                     TopicFile)
from .serializers import (DepartmentSerializer, QuestionSerializer,
                        MachineSerializer, AnswerSerializer, 
                        TopicSerializer, TrainingSerializer,
                        TrainingFileSerializer, TopicFileSerializer)
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
import threading
from rest_framework import viewsets, filters
from rest_framework.pagination import PageNumberPagination
from .models import Department
from .serializers import DepartmentSerializer, TrainingListSerializer
from chatbot.incremental import retrain
from chatbot.incremental import train

import threading
import json

chatbot = None
model_path = "chatbot/incremental/finalmodel.joblib"
intents_path = "chatbot/incremental/intents.json"

# Custom Pagination class
class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'  # Allow client to override the page size
    max_page_size = 100  # Maximum limit for page size


def import_chatbot_in_background():
    global chatbot
    from chatbot.incremental import chatbot  # takes 5 seconds to run

# Start the import in a separate thread
threading.Thread(target=import_chatbot_in_background).start()

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
        answer, tag = chatbot.get_answer(query)
        print(answer, tag, "LINE 77")
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
    filterset_fields = ['name', 'department']
    search_fields = ['name', 'department']
    ordering_fields = ['name', 'department'] 
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
    filterset_fields = ['title', 'content']  
    search_fields = ['title', 'content']
    ordering_fields = ['id', 'title'] 
    # ordering = ['name']  # Default ordering
    pagination_class = StandardResultsSetPagination    


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
            Q(title__icontains=query) | Q(content__icontains=query)
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
            Q(title__icontains=query) | Q(content__icontains=query)
        )
        count = trainings.count()
    else:
        count = Training.objects.count()
    
    # Return the response
    return Response({'count': count})


def addTopicToModel(questions, topic, answers):
    retrain.retrain_model_and_update_intents(model_path, 
                                            intents_path,
                                            questions, topic.label, answers)


def train_model_task():
    train.train_model(model_path, intents_path)

def retrain_model(request):
    thread = threading.Thread(target=train_model_task, daemon=True)
    thread.start()
    return JsonResponse({"message": "Model Trained Successfully"}, status=200)


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
            print(existing_machine_instance)
            new_topic = Topic.objects.create(label=label, machine=existing_machine_instance)
            serializer = TopicSerializer(new_topic)
            if questions and answers:
                for question in questions:
                    Question.objects.create(text=question, topic=new_topic)
                for answer in answers:
                    Answer.objects.create(text=answer, topic=new_topic)
                    
                threading.Thread(target=addTopicToModel, args=(questions, new_topic, answers)).start()
        
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
                # Update questions
                current_questions_texts = set(topic.questions.values_list('text', flat=True))
                incoming_questions_texts = set(questions)
                
                # Add new questions that are not in the current questions
                new_questions = incoming_questions_texts - current_questions_texts
                for question_text in new_questions:
                    Question.objects.create(topic=topic, text=question_text)
                
                # Remove questions that are no longer in the incoming questions
                questions_to_remove = current_questions_texts - incoming_questions_texts
                topic.questions.filter(text__in=questions_to_remove).delete()

                # Update answers
                current_answers_texts = set(topic.answers.values_list('text', flat=True))
                incoming_answers_texts = set(answers)
                
                # Add new answers that are not in the current answers
                new_answers = incoming_answers_texts - current_answers_texts
                for answer_text in new_answers:
                    Answer.objects.create(topic=topic, text=answer_text)
                
                # Remove answers that are no longer in the incoming answers
                answers_to_remove = current_answers_texts - incoming_answers_texts
                topic.answers.filter(text__in=answers_to_remove).delete()

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