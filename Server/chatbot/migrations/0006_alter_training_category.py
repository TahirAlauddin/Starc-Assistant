# Generated by Django 4.2.7 on 2024-05-05 10:49

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0005_alter_training_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='training',
            name='category',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='chatbot.department'),
        ),
    ]