import joblib
import json
import random

model = joblib.load("chatbot/incremental/finalmodel.joblib")
intents = json.loads(open('chatbot/incremental/intents.json', encoding="utf-8").read())


def get_predicted_tag(predicted_tag, intents):
    print("Predicted tag is", predicted_tag)
    for intent in intents["intents"]:
        tag = intent["tag"]

        if tag == predicted_tag:
            return random.choice(intent['responses']) 


# Set a threshold for the prediction probability
threshold = 0.005

def get_answer(question):
    probabilities = model.predict_proba_one(question)
    # Get the tag with the highest probability
    predicted_tag, highest_probability = max(probabilities.items(), key=lambda item: item[1])
    print(predicted_tag, highest_probability)

    # Check if the highest probability meets the threshold
    if highest_probability < threshold:
        return "Non sono riuscito a capire cosa intendi", None
    else:
        value = get_predicted_tag(predicted_tag, intents)
        print(value)
        
        if value:
            return value, predicted_tag
        return "Non sono riuscito a capire cosa intendi", None
