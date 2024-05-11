# Generated by Django 4.2.7 on 2024-05-10 15:48

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('chatbot', '0006_alter_training_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='MachineList',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('added_date', models.DateTimeField(auto_now_add=True)),
                ('department', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='machineslist', to='chatbot.department')),
            ],
        ),
    ]
