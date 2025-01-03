from django.db import models
from django.db.models.signals import post_delete
import time
from django.dispatch import receiver
import os    

class Department(models.Model):
    """
    Represents a department within an organization.
    """
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return str(self.name)


class Machine(models.Model):
    """
    Represents a machine in a department.
    """
    name = models.CharField(max_length=255)
    department = models.ForeignKey(
        "chatbot.Department",
        on_delete=models.CASCADE,
        related_name='machines'
    )

    def __str__(self) -> str:
        return f'Machine#{self.id} (Name={self.name})'


class Question(models.Model):
    """
    Represents a question related to a specific topic.
    """
    text = models.TextField()
    topic = models.ForeignKey(
        "chatbot.Topic",
        on_delete=models.CASCADE,
        related_name='questions'
    )

    def __str__(self) -> str:
        return f'Q#{self.id} ({self.text[:20]}...)'

class Answer(models.Model):
    """
    Represents an answer related to a specific topic.
    """
    text = models.TextField()
    topic = models.ForeignKey(
        "chatbot.Topic",
        on_delete=models.CASCADE,
        related_name='answers'
    )

    def __str__(self) -> str:
        return f'Ans#{self.id} ({self.text[:20]}...)'
    

class Topic(models.Model):
    """
    Represents a topic related to a machine.
    """
    label = models.CharField(max_length=255, unique=True)
    machine = models.ForeignKey(
        "chatbot.Machine",
        on_delete=models.CASCADE,
        related_name='topics'
    )
    isTrained = models.BooleanField(default=False)

    class Meta:
        ordering = ['-id']
    
    def get_questions(self):
        """
        Retrieve all questions associated with this topic.
        """
        return self.questions.all()

    def get_answer(self):
        """
        Retrieve the answer associated with this topic.
        """
        return self.answers.first().text if self.answers.exists() else None

class Manual(models.Model):
    """
    Represents a manual related to a specific topic.
    """
    topic = models.ForeignKey(
        "chatbot.Topic",
        on_delete=models.CASCADE,
        related_name='manuals'
    )
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='manuals/')

    def __str__(self) -> str:
        return f'Manual#{self.id} ({self.name})'

class Training(models.Model):
    """
    Represents a training session.
    """
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True, null=True)
    # category = models.CharField(max_length=255, null=True, blank=True)
    category = models.ForeignKey('chatbot.Department', 
                                 on_delete=models.SET_NULL,
                                 null=True)
    def __str__(self) -> str:
        return f"Training#{self.id} ({self.title})"

    class Meta:
        ordering = ['id']  # Choose an appropriate field to order by

class TrainingFile(models.Model):
    """
    Represents a file associated with a training session.
    """
    training = models.ForeignKey(
        Training,
        related_name='files',
        on_delete=models.CASCADE
    )
    file = models.FileField(upload_to='training_files/')

class TopicFile(models.Model):
    file = models.FileField(upload_to='topic-files/')
    topic = models.ForeignKey('chatbot.Topic', 
                               on_delete=models.CASCADE,
                               related_name='files') 

@receiver(post_delete, sender=TopicFile)
def topic_file_post_delete(sender, instance, **kwargs):
    file_path = instance.file.path
    print(file_path)
    if instance.file:
        start_time = time.time()
        while True:
            try:
                os.remove(file_path)
                print(f"File {file_path} successfully deleted.")
                break
            except FileNotFoundError:
                print(f"File {file_path} not found. Exiting.")
                break
            except PermissionError as e:
                print(f"PermissionError: {e}. Retrying...")
                if time.time() - start_time > 5:
                    print(f"Failed to delete the file after 5 seconds: {e}")
                    break
                time.sleep(1)  # Wait for 1 second before retrying
            except Exception as e:
                print(f"Error deleting file: {e}")
                break
            
            
@receiver(post_delete, sender=TrainingFile)
def training_file_post_delete(sender, instance, **kwargs):
    file_path = instance.file.path
    print(file_path)
    if instance.file:
        start_time = time.time()
        while True:
            try:
                os.remove(file_path)
                print(f"File {file_path} successfully deleted.")
                break
            except FileNotFoundError:
                print(f"File {file_path} not found. Exiting.")
                break
            except PermissionError as e:
                print(f"PermissionError: {e}. Retrying...")
                if time.time() - start_time > 5:
                    print(f"Failed to delete the file after 5 seconds: {e}")
                    break
                time.sleep(1)  # Wait for 1 second before retrying
            except Exception as e:
                print(f"Error deleting file: {e}")
                break
            