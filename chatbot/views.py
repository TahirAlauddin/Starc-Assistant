
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from rest_framework import viewsets
from .models import Department, Question, Machine, Answer, Topic, Training
from .serializers import (DepartmentSerializer, QuestionSerializer,
                          MachineSerializer, AnswerSerializer, 
                          TopicSerializer, TrainingSerializer)
import threading
import json

chatbot = None

@csrf_exempt
def import_chatbot_in_background():
    global chatbot
    from chatbot.chatbot import chatbot  # takes 5 seconds to run


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

    return render(request, 'login.html')



@csrf_exempt
def logout_view(request):
    auth_logout(request)
    return JsonResponse({'status': 'success'})


@csrf_exempt
def chatbot_model_view(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        query = data.get('query')
        answer = chatbot.get_answer(query)
        print(answer)
        return JsonResponse({'response': answer})
    return JsonResponse({'response': 'ERROR OCCURED'})


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer

class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer

class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer

class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
