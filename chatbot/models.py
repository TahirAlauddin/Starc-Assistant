from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self) -> str:
        return str(self.name)

class Question(models.Model):
    text = models.TextField()
    topic = models.ForeignKey("chatbot.Topic",
                              on_delete=models.CASCADE,
                              related_name='questions')

    def __str__(self) -> str:
        return f'Q#{self.id} ({self.text:20})'

class Answer(models.Model):
    text = models.TextField()
    topic = models.ForeignKey("chatbot.Topic",
                              on_delete=models.CASCADE,
                              related_name='answers')


class Machine(models.Model):
    name = models.CharField(max_length=255)
    department = models.ForeignKey("chatbot.Department",
                                   on_delete=models.CASCADE,
                                   related_name='machines')
    
    def __str__(self) -> str:
        return f'{self.name} ({self.department})'


class Topic(models.Model):
    label = models.CharField(max_length=255)
    machine = models.ForeignKey("chatbot.Machine",
                                on_delete=models.CASCADE,
                                related_name='topics')


class Training(models.Model):
    file = models.FileField(max_length=100, upload_to='training')
    content = models.TextField(blank=True, null=True)
    
