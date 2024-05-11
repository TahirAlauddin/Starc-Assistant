from creme import compose
from creme import feature_extraction
from creme import naive_bayes
from creme import metrics
import json
import joblib

model_path = "chatbot/incremental/finalmodel.joblib"
intents_path = "chatbot/incremental/intents.json"

def train_model(model_path, intents_path):
    # Pipeline for extracting TF-IDF features and using Multinomial Naive Bayes for classification
    model = compose.Pipeline(
        ('vect', feature_extraction.TFIDF(lowercase=True, ngram_range=(1, 6))),
        ('nb', naive_bayes.MultinomialNB(alpha=0.3))
    )

    intents = json.loads(open('./chatbot/incremental/intents.json', encoding="utf-8").read())

    # Metric to evaluate the model
    metric = metrics.Accuracy()

    for intent in intents["intents"]:
        tag = intent["tag"]
        for question in intent["patterns"]:
            # Train the model incrementally
            model.fit_one(question, tag)

            # Predict the tag for the current question
            y_pred = model.predict_one(question)

            # Update metric
            metric.update(y_true=tag, y_pred=y_pred)

            print(f"Tag: '{tag}' Predicted Tag '{y_pred}'. Current accuracy: {metric.get()}")

    joblib.dump(model, "./chatbot/incremental/finalmodel.joblib")
