import json
import pickle
import numpy as np
import tensorflow as tf
import nltk
from nltk.stem import WordNetLemmatizer

tf.keras.utils.disable_interactive_logging()


def clean_up_sentence(sentence):
    lemmatizer = WordNetLemmatizer()
    sentence = nltk.word_tokenize(sentence)
    sentence = [lemmatizer.lemmatize(word) for word in sentence]

    return sentence


def bag_of_words(sentence):
    words = pickle.load(open("chatbot/words.pkl", "rb"))
    sentence = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for word in sentence:
        for i, w in enumerate(words):
            if word == w:
                bag[i] = 1

    return np.array(bag)


def predict_class(sentence):
    classes = pickle.load(open("chatbot/classes.pkl", "rb"))
    model = tf.keras.models.load_model("chatbot/chatbot_model.h5")

    bow = bag_of_words(sentence)
    res = model.predict(np.array([bow]))[0]
    ERROR_THRESHOLD = 0.4

    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]

    results.sort(key=lambda x: x[1], reverse=True)

    return_list = []

    for result in results:
        return_list.append(
            {"intent": classes[result[0]], 'probability': str(result[1])})

    print(return_list)
    return return_list


def get_response(intents_list, intents_json):
    tag = intents_list[0]["intent"]
    list_of_intents = intents_json["intents"]

    for i in list_of_intents:
        if i["tag"] == tag:
            result = np.random.choice(i["responses"])
            break

    return result


def main():
    intents = json.loads(open('chatbot/intents.json', encoding="utf-8").read())
    print("GO!!")

    while True:
        message = input("")
        if not message:
            continue
        ints = predict_class(message)
        if not ints:
            print("Non sono sicuro della tua domanda. Potresti fornire ulteriori dettagli o chiarimenti?")
        else:
            res = get_response(ints, intents)
            print(res)

if __name__ == '__main__':
    main()
