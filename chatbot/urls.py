from django.urls import path, include
from rest_framework.routers import DefaultRouter, SimpleRouter
from .views import (DepartmentViewSet, QuestionViewSet, MachineViewSet, 
                    AnswerViewSet, TopicViewSet, TrainingViewSet,
                    login_view, logout_view, chatbot_model_view)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'machines', MachineViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'topics', TopicViewSet)
router.register(r'trainings', TrainingViewSet)

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('chatbot_model/', chatbot_model_view, name='chatbot-model'),
    path('', include(router.urls)),
]
