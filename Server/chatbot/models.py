from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
import os    

class Department(models.Model):
    """
    Represents a department within an organization.
    """
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return str(self.name)

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

@receiver(pre_delete, sender=TopicFile)
def topic_file_pre_delete(sender, instance, **kwargs):
    print(instance.file.path)
    if (instance.file):
        os.remove(instance.file.path)

class MachineList(models.Model):
    """
    Represents a machine in a department.
    """
    name = models.CharField(max_length=255)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='machineslist'
    )
    added_date = models.DateTimeField(auto_now_add=True)  

    def __str__(self) -> str:
        return f'Machine#{self.id} (Name={self.name})'        