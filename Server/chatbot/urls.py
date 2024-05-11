from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from .views import (DepartmentViewSet, QuestionViewSet, MachineViewSet, 
                    AnswerViewSet, TopicViewSet, TrainingViewSet,
                    TrainingFileViewSet, TopicFileViewSet,
                    login_view, logout_view, chatbot_model_view,
                    get_training_count, get_training_file,
                    upload_data, retrain_model, TopicFileBulkView, 
                    BulkTrainingFilesAPIView, MachineListView, delete_machine, edit_machine, get_machine_count, add_machine)


from rest_framework_nested.routers import SimpleRouter, NestedSimpleRouter



@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'training':             reverse('training-list', request=request, format=format), # Training objects (text data)
        'topic':                reverse('topic-list', request=request, format=format), # Chatbot Topics
        'department':           reverse('department-list', request=request, format=format),
        'machine':              reverse('machine-list', request=request, format=format),
        'training-with-file':   reverse('training-with-file', request=request, format=format), # Training File Objects
        'training-count':       reverse('training-count', request=request, format=format), # Total count of training objects
        
    })


router = SimpleRouter()
router.register(r'training', TrainingViewSet, basename='training')
training_router = NestedSimpleRouter(router, 'training', lookup='training')
training_router.register(r'training-files', TrainingFileViewSet, basename='training-files')

router.register(r'topic', TopicViewSet, basename='topic')
topic_router = NestedSimpleRouter(router, 'topic', lookup='topic')
topic_router.register(r'questions', QuestionViewSet, basename='topic-questions')
topic_router.register(r'answers', AnswerViewSet, basename='topic-answers')
topic_router.register(r'topic-files', TopicFileViewSet, basename='topic-files')

# Create a router and register our viewsets with it.
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'machines', MachineViewSet, basename='machine')

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('upload-data/', upload_data, name='upload-data'),
    path('retrain-model/', retrain_model, name='retrain-model'),
    path('chatbot_model/', chatbot_model_view, name='chatbot-model'),
    path('training-with-file/', get_training_file, name='training-with-file'),
    path('training-count/', get_training_count, name='training-count'),

    path('machines/', MachineListView.as_view(), name='machine-list'), 
    path('machines/<int:machine_id>/delete/', delete_machine, name='delete-machine'),
    path('machines/<int:machine_id>/edit/', edit_machine, name='edit-machine'),
    path('machine-count/', get_machine_count, name='machine-count'),
    path('machines/add/', add_machine, name='add-machine'),
    
    
    
    path('', include(router.urls)),
    path('', include(training_router.urls)),
    # path('', include(answer_router.urls)),
    path('topics/files/upload/', TopicFileBulkView.as_view(), name='topic-file-upload'),
    path('training/<int:training_pk>/training-files-bulk/',
          BulkTrainingFilesAPIView.as_view(), name='bulk-training-files'),

    path('', include(topic_router.urls)),
    path("__debug__/", include("debug_toolbar.urls")),
]


urlpatterns += [
    path('', api_root, name='api-root'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



