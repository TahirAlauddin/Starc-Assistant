from django.urls import path
from .views import index, chatbot, chatbot_model

urlpatterns = [
    path('', index, name='index'),
    path('chatbot', chatbot, name='chatbot'),
    path('chatbot_model/<str:message>', chatbot_model, name='chatbot_model')
]
