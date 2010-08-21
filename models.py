from django.db import models
from django import forms
from django.template.defaultfilters import slugify

from .exceptions import (ChoiceDoesNotExist, ChoiceAlreadyExists,
                         FieldDoesNotExist, FieldAlreadyExists)

class Form(models.Model):
    slug        = models.SlugField(editable=False)
    name        = models.CharField(max_length=250)
    description = models.TextField()

    def __init__(self, *args, **kwargs):
        super(Form, self).__init__(*args, **kwargs)
        self._fields = None

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name).replace("-", "_")[:50]
        for field in self.fields:
            field.save()
        super(Form, self).save(*args, **kwargs)

    def as_django_form(self):
        properties = {}
        for field in self.fields:
            properties[field.slug] = field.as_django_form_field()
        return type(str(self.slug), (forms.Form,), properties)

    @property
    def fields(self):
        if self._fields is None:
            self._fields = list(self._field_set.all().order_by("position"))
        return self._fields

    def get_field(self, label):
        """
        Returns the field whose label is `label`, otherwise throws
        `FieldDoesNotExist`.
        """
        try:
            return (f for f in self.fields if f.label == label).next()
        except StopIteration:
            raise FieldDoesNotExist(
                "Tried to find the field '%s' but it doesn't exist." % label
                )

    def add_field(self, field_label, **field_properties):
        if any(f for f in self.fields if f.label == field_label):
            raise FieldAlreadyExists(
                "Tried to add field '%s' but it already is a field." % field_label
                )
        else:
            if len(self.fields) > 0:
                position = max(f.position for f in self.fields) + 1
            else:
                position = 0
            field = Field.objects.create(form=self,
                                         label=field_label,
                                         position=position,
                                         **field_properties)
            self._fields.append(field)
            return field

    def remove_field(self, field_label):
        field = self.get_field(field_label)
        self._fields = filter(lambda f: f != field,
                              self._fields)
        for f in self.fields:
            if f.position > field.position:
                f.position -= 1
        field.delete()
        return field

    def rename_field(self, old, new):
        field = self.get_field(old)
        field.label = new
        return field


class Field(models.Model):
    form      = models.ForeignKey(Form, related_name="_field_set")
    slug      = models.SlugField(editable=False)
    label     = models.CharField(max_length=250)
    help_text = models.CharField(max_length=250, default="")
    type      = models.CharField(max_length=250, default="CharField")
    position  = models.IntegerField(editable=False)
    required  = models.BooleanField(default=True)
    widget    = models.CharField(max_length=250, default="")

    def __init__(self, *args, **kwargs):
        super(Field, self).__init__(*args, **kwargs)
        self._choices = None

    def save(self, *args, **kwargs):
        self.slug = slugify(self.label).replace("-", "_")[:50]
        for choice in self.choices:
            choice.save()
        super(Field, self).save(*args, **kwargs)

    def as_django_form_field(self):
        # TODO: catch exceptions and display helpful error messages
        field_properties = { "help_text": self.help_text,
                             "required": self.required }
        if self.choices:
            field_properties["choices"] = ((c.slug, c.label)
                                           for c in self.choices)
        if self.widget:
            field_properties["widget"] = getattr(forms.widgets, self.widget)()
        return getattr(forms.fields, self.type)(**field_properties)

    @property
    def choices(self):
        if self._choices is None:
            self._choices = list(self._choice_set.all().order_by("position"))
        return self._choices

    def add_choice(self, choice_label):
        if any(c for c in self.choices if c.label == choice_label):
            raise ChoiceAlreadyExists(
                "Tried to add choice '%s' but it already is a choice." % choice_label
                )
        else:
            if len(self.choices) > 0:
                position = max(c.position for c in self.choices) + 1
            else:
                position = 0
            choice = Choice.objects.create(field=self,
                                           label=choice_label,
                                           position=position)
            self._choices.append(choice)
            return choice

    def remove_choice(self, choice_label):
        try:
            choice = (c for c in self.choices if c.label == choice_label).next()
        except StopIteration:
            raise ChoiceDoesNotExist(
                "Tried to remove the choice '%s' but it doesn't exist." % choice_label
                )
        else:
            self._choices = filter(lambda c: c != choice,
                                   self._choices)
            for c in self.choices:
                if c.position > choice.position:
                    c.position -= 1
            choice.delete()
            return choice

class Choice(models.Model):
    field    = models.ForeignKey(Field, related_name="_choice_set")
    slug     = models.SlugField(editable=False)
    label    = models.CharField(max_length=250)
    position = models.IntegerField()

    def save(self, *args, **kwargs):
        self.slug = slugify(self.label).replace("-", "_")[:50]
        super(Choice, self).save(*args, **kwargs)
