from django import forms
from django.test import TestCase

from .exceptions import (ChoiceDoesNotExist, ChoiceAlreadyExists,
                         FieldDoesNotExist, FieldAlreadyExists)
from .models import Form, Field, Choice
from .transactions import Transaction

class BaseTestCase(TestCase):
    def setUp(self):
        self.form = Form.objects.create(name="Test Form",
                                        description="A test form")

class AddRemoveFieldTestCase(BaseTestCase):
    def test_add_field(self):
        self.assertEqual(len(self.form.fields), 0,
                         "Should start with 0 fields")
        self.form.add_field("Email", type="EmailField")
        self.assertEqual(len(self.form.fields), 1,
                         "Should now have 1 field")
        self.assertTrue(isinstance(self.form.fields[0], Field),
                        "The new field should be an instance of Field.")

    def test_add_existing_field(self):
        self.form.add_field("Email")
        try:
            self.form.add_field("Email")
        except FieldAlreadyExists:
            self.assertTrue(True,
                            "Adding a field that already exists should throw an error.")
        else:
            self.assertTrue(False,
                            "Adding a field that already exists should throw an error.")

    def test_remove_field(self):
        self.form.add_field("Email", type="EmailField")
        self.assertEqual(len(self.form.fields), 1,
                         "Should have 1 field")
        self.form.remove_field("Email")
        self.assertEqual(len(self.form.fields), 0,
                         "Should now have 0 fields")

    def test_remove_nonexistant_field(self):
        try:
            self.form.remove_field("non-existant field")
        except FieldDoesNotExist:
            self.assertTrue(True,
                            "Removing non-existant field throws an error")
        else:
            self.assertTrue(False,
                            "Removing non-existant field throws an error")

class AddRemoveChoiceTestCase(BaseTestCase):
    def setUp(self):
        super(AddRemoveChoiceTestCase, self).setUp()
        self.field = self.form.add_field("Happy and you know it?",
                                         type="MultipleChoiceField")

    def test_add_choice(self):
        self.assertEqual(len(self.field.choices), 0,
                         "Should start with 0 choices")
        self.field.add_choice("Yes")
        self.assertEqual(len(self.field.choices), 1,
                         "Should now have 1 choice")
        self.assertTrue(isinstance(self.field.choices[0], Choice),
                        "The new choice should be an instance of Choice.")

    def test_add_existing_choice(self):
        self.field.add_choice("Yes")
        try:
            self.field.add_choice("Yes")
        except ChoiceAlreadyExists:
            self.assertTrue(True,
                            "Adding a choice that already exists should throw an error.")
        else:
            self.assertTrue(False,
                            "Adding a choice that already exists should throw an error.")

    def test_remove_choice(self):
        self.field.add_choice("No")
        self.assertEqual(len(self.field.choices), 1,
                         "Should have 1 choice")
        self.field.remove_choice("No")
        self.assertEqual(len(self.field.choices), 0,
                         "Should now have 0 fields")

    def test_remove_nonexistant_choice(self):
        try:
            self.field.remove_choice("non-existant choice")
        except ChoiceDoesNotExist:
            self.assertTrue(True,
                            "Removing non-existant choice throws an error")
        else:
            self.assertTrue(False,
                            "Removing non-existant choice throws an error")

class ModelToDjangoFormTestCase(BaseTestCase):
    def setUp(self):
        super(ModelToDjangoFormTestCase, self).setUp()
        self.field = self.form.add_field("Happy and you know it?",
                                         type="MultipleChoiceField")
        self.field.add_choice("yes")
        self.field.add_choice("no")

    def test_create_django_form_field(self):
        form_field = self.field.as_django_form_field()
        self.assertTrue(isinstance(form_field, forms.fields.Field),
                        "field.as_django_form_field() should return an instance of a django Field.")
        self.assertEqual(len(form_field.choices), len(self.field.choices),
                         "The django form field should have same number of choices as field model instance.")

    def test_create_django_form(self):
        TestForm = self.form.as_django_form()
        self.assertTrue(issubclass(TestForm, forms.Form),
                        "form.as_django_form() should return a subclass of a django Form class")
        self.assertEqual(len(TestForm().fields), len(self.form.fields),
                         "The django form should have same number of fields as the form model instance.")

class TransactionsTestCase(BaseTestCase):
    def test_change_name(self):
        transaction = Transaction(action="change name",
                                  to="New Name")
        transaction.apply_to(self.form)
        self.assertEqual(self.form.name, "New Name")

    def test_change_description(self):
        transaction = Transaction(action="change description",
                                  to="New description")
        transaction.apply_to(self.form)
        self.assertEqual(self.form.description, "New description")
