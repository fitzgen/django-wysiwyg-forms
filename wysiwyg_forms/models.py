import json

from django.db import models
from django import forms
from django.template.defaultfilters import slugify
from django.utils.datastructures import SortedDict
from django.utils import simplejson as json

from .exceptions import (ChoiceDoesNotExist, ChoiceAlreadyExists,
                         FieldDoesNotExist, FieldAlreadyExists,
                         WysiwygFormsException)
from .utils import field_type_has_choices

class Form(models.Model):
    slug        = models.SlugField(editable=False)
    name        = models.CharField(max_length=250)
    description = models.TextField()

    # Don't use Django's serializers because it is just too cluttered.
    class JSONEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, Form):
                return { "name"        : obj.name,
                         "id"          : obj.id,
                         "description" : obj.description,
                         "fields"      : [{ "label"     : f.label,
                                            "name"      : f.slug,
                                            "type"      : f.type,
                                            "widget"    : f.widget,
                                            "help_text" : f.help_text,
                                            "required"  : f.required,
                                            "position"  : f.position,
                                            "choices"   : [{ "label"    : c.label,
                                                             "position" : c.position }
                                                           for c in f.choices] }
                                          for f in obj.fields] }
            else:
                return super(JSONEncoder, self).default(obj)

    def __init__(self, *args, **kwargs):
        super(Form, self).__init__(*args, **kwargs)
        self._fields = None

    def _ensure_field_positions(self):
        """
        Iterates through self.fields and makes sure that they have the correct
        position attribute.
        """
        for f, i in zip(self.fields, range(len(self.fields))):
            f.position = i

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name).replace("-", "_")[:50]
        for field in self.fields:
            field.save()
        super(Form, self).save(*args, **kwargs)

    def as_django_form(self):
        properties = SortedDict()
        for field in self.fields:
            properties[field.slug] = field.as_django_form_field()
        return type(str(self.slug), (forms.Form,), properties)

    def as_json(self):
        return json.dumps(self, cls=self.JSONEncoder)

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
            position = len(self.fields)
            field = Field.objects.create(form=self,
                                         label=field_label,
                                         position=position,
                                         **field_properties)
            self.fields.append(field)
            self._ensure_field_positions()
            return field

    def remove_field(self, field_label):
        field = self.get_field(field_label)
        self.fields.remove(field)
        self._ensure_field_positions()
        field.delete()
        return field

    def move_field(self, label, new_index):
        field = self.get_field(label)
        old_index = self.fields.index(field)
        self.fields.insert(new_index, self.fields.pop(old_index))
        self._ensure_field_positions()
        return field

class Field(models.Model):
    form      = models.ForeignKey(Form, related_name="_field_set")
    slug      = models.SlugField(editable=False)
    label     = models.CharField(max_length=250)
    help_text = models.CharField(max_length=250, default="")
    type      = models.CharField(max_length=250, default="CharField")
    position  = models.IntegerField(editable=False)
    required  = models.BooleanField(default=True)
    widget    = models.CharField(max_length=250, default="TextInput")

    def __init__(self, *args, **kwargs):
        super(Field, self).__init__(*args, **kwargs)
        self._choices = None

    def _ensure_choice_positions(self):
        """
        Iterates through self.choices and makes sure that they have the correct
        position attribute.
        """
        for c, i in zip(self.choices, range(len(self.choices))):
            c.position = i

    def save(self, *args, **kwargs):
        self.slug = slugify(self.label).replace("-", "_")[:50]
        for choice in self.choices:
            choice.save()
        super(Field, self).save(*args, **kwargs)

    def as_django_form_field(self):
        # TODO: catch exceptions and display helpful error messages
        field_properties = { "help_text": self.help_text,
                             "required": self.required }
        if field_type_has_choices(self.type) and self.choices:
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

    def get_choice(self, label):
        """
        Returns the choice whose label is `label`, otherwise throws
        `ChoiceDoesNotExist`.
        """
        try:
            return (c for c in self.choices if c.label == label).next()
        except StopIteration:
            raise ChoiceDoesNotExist(
                "Tried to find the choice '%s' but it doesn't exist." % label
                )

    def add_choice(self, choice_label):
        if not field_type_has_choices(self.type):
            raise WysiwygFormsException(
                "The field type '%s' doesn't support choices" % self.type
                )
        else:
            if any(c for c in self.choices if c.label == choice_label):
                raise ChoiceAlreadyExists(
                    "Tried to add choice '%s' but it already is a choice." % choice_label
                    )
            else:
                position = len(self.choices)
                choice = Choice.objects.create(field=self,
                                               label=choice_label,
                                               position=position)
                self.choices.append(choice)
                self._ensure_choice_positions()
                return choice

    def remove_choice(self, choice_label):
        choice = self.get_choice(choice_label)
        self.choices.remove(choice)
        self._ensure_choice_positions()
        choice.delete()
        return choice

    def move_choice(self, choice_label, new_index):
        choice = self.get_choice(choice_label)
        old_index = self.choices.index(choice)
        self.choices.insert(new_index, self.choices.pop(old_index))
        self._ensure_choice_positions()
        return choice

class Choice(models.Model):
    field    = models.ForeignKey(Field, related_name="_choice_set")
    slug     = models.SlugField(editable=False)
    label    = models.CharField(max_length=250)
    position = models.IntegerField()

    def save(self, *args, **kwargs):
        self.slug = slugify(self.label).replace("-", "_")[:50]
        super(Choice, self).save(*args, **kwargs)
