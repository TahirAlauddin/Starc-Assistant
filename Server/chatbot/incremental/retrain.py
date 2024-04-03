import joblib
import json

def load_model(model_path):
    """Load the existing model from the specified path."""
    return joblib.load(model_path)

def update_model(model, questions, tag):
    """Update the model with new questions and a single tag."""
    for question in questions:
        model.fit_one(question, tag)
    return model

def save_model(model, model_path):
    """Save the updated model to the specified path."""
    joblib.dump(model, model_path)

def update_intents_json(intents_path, tag, questions, response):
    """Update the intents.json file with new questions and their tag."""
    with open(intents_path, 'r', encoding='utf-8') as file:
        intents = json.load(file)
    
    # Check if the tag already exists, update it if so, else append a new intent
    for intent in intents['intents']:
        if intent['tag'] == tag:
            intent['patterns'].extend(questions)
            break
    else:
        new_intent = {
            "tag": tag,
            "patterns": questions,
            "responses": response
        }
        intents['intents'].append(new_intent)
    
    with open(intents_path, 'w', encoding='utf-8') as file:
        json.dump(intents, file, ensure_ascii=False, indent=2)


# main function
def retrain_model_and_update_intents(model_path, intents_path, questions, tag, response):
    """Main function to load, update, and save the model, and update intents.json."""
    model = load_model(model_path)
    model = update_model(model, questions, tag)
    save_model(model, model_path)
    update_intents_json(intents_path, tag, questions, response)

# Example usage:
questions = ["Your new question here"]
tag = "Your tag here"
response =[ "Your response here"]
model_path = "chatbot/incremental/finalmodel.joblib"
intents_path = "chatbot/incremental/intents.json"

        
if __name__ == '__main__':
    # Call the function with the desired parameters
    retrain_model_and_update_intents(model_path, intents_path, questions, tag, response)
