from .model import NeuraNet
from .utils import bag_of_words, tokenize
from django.conf import settings
import random
import json
import torch
import os

# from sys import path
# import os
# path.append(os.path.abspath('./chatbot/chatbot'))
 
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

chatbot_path = os.path.join(settings.BASE_DIR, 'chatbot/chatbot')
json_path = os.path.join(chatbot_path, 'intents.json')

with open(json_path, 'r') as f:
    intents = json.load(f)

FILE = os.path.join(chatbot_path, "data.pth")

data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data["all_words"]
tags = data["tags"]
model_state = data["model_state"]

model = NeuraNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()


def get_answer(query):
    sentence = tokenize(query)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X)

    output = model(X)
    _, predicted = torch.max(output, dim=1)
    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

    if prob.item() > 0.9:
        for intent in intents["intents"]:
            if tag == intent["tag"]:
                return random.choice(intent['responses'])

    else:
        return "I couldn't understand"

if __name__ == '__main__':
    print(get_answer("Come faccio a sapere quando è il momento di sostituire gli utensili"))