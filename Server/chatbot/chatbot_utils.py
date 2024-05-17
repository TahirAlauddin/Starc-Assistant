from chatbot.incremental import retrain
from chatbot.incremental import train
from .models import Topic
import json

is_training_in_progress = False


# Incremental Learning
def addTopicToModel(questions, topic, answers,
                     model_path, intents_path):
    retrain.retrain_model_and_update_intents(model_path, 
                                            intents_path,
                                            questions, topic.label, answers)

# Preparing for retraining model
def create_intents_file(intents_path):
    intents_data = {
        "intents": []
    }

    topics = Topic.objects.all()

    for topic in topics:
        intent = {
            "tag": topic.label,
            "patterns": [question.text for question in topic.questions.all()],
            "responses": [answer.text for answer in topic.answers.all()]
        }
        intents_data["intents"].append(intent)

    with open(intents_path, 'w') as f:
        json.dump(intents_data, f, indent=2)
    


