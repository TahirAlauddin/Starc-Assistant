from django.shortcuts import render
from django.http import JsonResponse
from model.chat_bot import get_response, predict_class
import json


def index(request):
    return render(request, 'index.html')

def chatbot(request):
    return render(request, 'chatbot.html')

def chatbot_model(request, message: str):
    intents = json.loads(open('chatbot/intents.json', encoding="utf-8").read())

    if not message:
        return JsonResponse({'message': 'failed'})
        
    ints = predict_class(message)
    if not ints:
        return JsonResponse({"message": "Non sono sicuro della tua domanda. Potresti fornire ulteriori dettagli o chiarimenti?"})
    else:
        res = get_response(ints, intents)

    return JsonResponse({'message': res})
