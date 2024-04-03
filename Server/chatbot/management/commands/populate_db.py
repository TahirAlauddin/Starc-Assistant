from django.core.management.base import BaseCommand
from chatbot.models import Question, Answer, Topic, Machine, Department
from django.db import transaction
import json

class Command(BaseCommand):
    help = 'Populates data from Intents.json to the databas'

    def handle(self, *args, **options):
        # Code for your custom command goes here
        self.add_data_to_db()
        self.stdout.write(self.style.SUCCESS('Question Answers added to Database successfully'))

    def add_data_to_db(self):
        # Assuming there's a Machine model instance you want to associate with the topic
        # This example assumes there's at least one Machine instance in the database
        sure = input('Are you sure?')
        if not sure:
            return
                
        # Department mappings based on your comments
        department_mappings = {
            'Tornitura': ["Graziano", "Mori Seiki", "Okuma", "Puma SMX", "Doosan TT", "DMG Mori"],
            'Rettifiche': ["Proflex 2", "Proflex 3", "Lizzini", "Kopp", "Sagitech"],
            'Qualita': ["Adcole", "Altimetro", "Calibro", "Micrometro", "Taylor Hobson", "Proiettore Di Profili", "Durometro", "3D CMM", "Attacco Acido"]
        }

        for department, machines in department_mappings.items():
            department = Department.objects.create(name=department)
            for machine_name in machines:
                Machine.objects.create(name=machine_name, department=department)
        
        with transaction.atomic():
            department = Department.objects.first()
            machine, _ = Machine.objects.get_or_create(name="DefaultMachine", department=department)

            # Create a new Topic
            intents = json.load(open('intents.json', encoding='utf-8')).get('intents', [])
            for intent in intents:      
                conversational_programming_topic, _ = Topic.objects.get_or_create(
                    label=f"{intent['tag']}",
                    machine=machine,
                    isTrained=True
                )
                # Define questions
                questions = intent['patterns']
                # Add questions to the topic
                for question_text in questions:
                    Question.objects.create(
                        text=question_text,
                        topic=conversational_programming_topic
                    )
                # Define an answer
                answers = intent['responses']
                
                # Add answer to the topic
                for answer_text in answers:
                    Answer.objects.create(
                        text=answer_text,
                        topic=conversational_programming_topic
                    )
                
                print(f'Tag {intent["tag"]} added')
