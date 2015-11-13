# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Choice',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slug', models.SlugField(editable=False)),
                ('label', models.CharField(max_length=250)),
                ('position', models.IntegerField()),
            ],
            options={
                'ordering': ('field__form__name', 'position'),
            },
        ),
        migrations.CreateModel(
            name='Field',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slug', models.SlugField(editable=False)),
                ('label', models.CharField(max_length=250)),
                ('help_text', models.TextField(default=b'', blank=True)),
                ('type', models.CharField(default=b'CharField', max_length=250)),
                ('position', models.IntegerField()),
                ('required', models.BooleanField(default=True)),
                ('widget', models.CharField(default=b'TextInput', max_length=250)),
            ],
            options={
                'ordering': ('form__name', 'position'),
            },
        ),
        migrations.CreateModel(
            name='Form',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('slug', models.SlugField(editable=False)),
                ('name', models.CharField(max_length=250)),
                ('revision', models.CharField(max_length=250, editable=False)),
                ('description', models.TextField()),
            ],
        ),
        migrations.AddField(
            model_name='field',
            name='form',
            field=models.ForeignKey(related_name='_field_set', to='wysiwyg_forms.Form'),
        ),
        migrations.AddField(
            model_name='choice',
            name='field',
            field=models.ForeignKey(related_name='_choice_set', to='wysiwyg_forms.Field'),
        ),
    ]
