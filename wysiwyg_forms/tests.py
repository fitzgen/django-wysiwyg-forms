# Python 2.5 compatibility
from __future__ import with_statement

from django import forms
from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import reverse
from django.template import Context, Template
from django.test import TestCase
from django.utils import simplejson as json

from .exceptions import (ChoiceDoesNotExist, ChoiceAlreadyExists,
                         FieldDoesNotExist, FieldAlreadyExists)
from .models import Form, Field, Choice
from .transactions import Transaction
from .views import WysiwygFormView

class BaseTestCase(TestCase):
    def setUp(self):
        self.form = Form.objects.create(name="Test Form",
                                        description="A test form")

    def get(self, url_name, *args, **kwargs):
        return self.client.get(reverse(url_name, args=args, kwargs=kwargs))

    def post(self, url_name, *args, **kwargs):
        data = kwargs.pop("data", None)
        extra = kwargs.pop("extra", {})
        return self.client.post(reverse(url_name, args=args, kwargs=kwargs),
                                data,
                                **extra)

class SaveFormTestCase(BaseTestCase):
    def test_revision_numbers(self):
        self.assertEqual(self.form.revision.split("-")[0], "0")
        self.form.name = "foo bar baz"
        self.form.save()
        self.assertEqual(self.form.revision.split("-")[0], "1")

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

class ApplyTransactionsViewTestCase(BaseTestCase):
    def test_apply_transactions(self):
        transactions = json.dumps([{ "action"       : "add field",
                                     "label"        : "hello" },
                                   { "action"       : "change field type",
                                     "label"        : "hello",
                                     "to"           : "MultipleChoiceField" },
                                   { "action"       : "add choice",
                                     "label"        : "hello",
                                     "choice_label" : "uno" },
                                   { "action"       : "add choice",
                                     "label"        : "hello",
                                     "choice_label" : "dos" },
                                   { "action"       : "add field",
                                     "label"        : "hola" },
                                   { "action"       : "change name",
                                     "to"           : "my form"}])

        response = self.post("wysiwyg_forms_apply_transactions",
                             self.form.id,
                             data={ "transactions" : transactions })
        self.assertEqual(response.status_code, 200)

        # Get the latest form instance
        self.form = Form.objects.get(id=self.form.id)

        self.assertEqual(len(self.form.fields), 2)
        self.assertEqual(len(self.form.get_field("hello").choices), 2)

        # TODO: Test the response JSON

class NewFormViewTestCase(BaseTestCase):
    def test_a_new_form_is_created(self):
        num_forms = Form.objects.all().count()
        response = self.get("wysiwyg_forms_new_form")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(num_forms + 1, Form.objects.all().count())

class WysiwygFormViewTestCase(BaseTestCase):
    def test_get_form_class(self):
        view = WysiwygFormView(form_id=self.form.id)
        form_class = view.get_form_class()
        self.assertTrue(issubclass(form_class, forms.Form),
                        "WysiwygFormView.get_form_class() should return a subclass of a django Form class")

        with self.assertRaises(ImproperlyConfigured):
            view.form_id = None
            view.get_form_class()

    def test_get_form_by_slug(self):
        view = WysiwygFormView(form_slug=self.form.slug)
        self.assertEqual(view.get_wysiwyg_form(), self.form)


class TransactionsTestCase(BaseTestCase):
    def setUp(self):
        super(TransactionsTestCase, self).setUp()
        self.field = self.form.add_field("Happy and you know it?",
                                         type="MultipleChoiceField")
        self.field.add_choice("yes")
        self.field.add_choice("no")

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

    def test_add_field(self):
        num_fields = len(self.form.fields)
        transaction = Transaction(action="add field",
                                  label="some new field")
        transaction.apply_to(self.form)
        self.assertEqual(num_fields + 1, len(self.form.fields))
        self.assertTrue(any(f.label == "some new field"
                            for f in self.form.fields))

    def test_remove_field(self):
        num_fields = len(self.form.fields)
        transaction = Transaction(action="remove field",
                                  label="Happy and you know it?")
        transaction.apply_to(self.form)
        self.assertEqual(num_fields - 1, len(self.form.fields))
        self.assertTrue(not any(f.label == "Happy and you know it?"
                                for f in self.form.fields))

    def test_rename_field(self):
        transaction = Transaction(action="rename field",
                                  label="Happy and you know it?",
                                  to="new label")
        transaction.apply_to(self.form)
        self.assertTrue(any(f.label == "new label"
                            for f in self.form.fields))
        self.assertTrue(not any(f.label == "Happy and you know it?"
                                for f in self.form.fields))

    def test_change_help_text(self):
        transaction = Transaction(action="change help text",
                                  label="Happy and you know it?",
                                  to="helpful")
        transaction.apply_to(self.form)
        self.assertEqual(self.field.help_text, "helpful")

    def test_move_field(self):
        self.form.add_field("a field")
        self.form.add_field("another field")
        self.form.add_field("some other field")
        num_fields = len(self.form.fields)
        transaction = Transaction(action="move field",
                                  label="a field",
                                  to=1)
        transaction.apply_to(self.form)
        self.assertEqual(self.form.fields[1].label, "a field")
        self.assertEqual(num_fields, len(self.form.fields))

    def test_change_field_type(self):
        transaction = Transaction(action="change field type",
                                  label="Happy and you know it?",
                                  to="BooleanField")
        transaction.apply_to(self.form)
        self.assertTrue(isinstance(self.field.as_django_form_field(),
                                   forms.fields.BooleanField))

    def test_change_field_widget(self):
        transaction = Transaction(action="change field widget",
                                  label="Happy and you know it?",
                                  to="RadioSelect")
        transaction.apply_to(self.form)
        self.assertTrue(isinstance(self.form.get_field("Happy and you know it?").as_django_form_field().widget,
                                   forms.widgets.RadioSelect))

    def test_change_field_required(self):
        self.assertEqual(self.form.get_field("Happy and you know it?").as_django_form_field().required,
                         True)
        transaction = Transaction(action="change field required",
                                  label="Happy and you know it?",
                                  to=False)
        transaction.apply_to(self.form)
        self.assertEqual(self.form.get_field("Happy and you know it?").as_django_form_field().required,
                         False)

    def test_add_choice(self):
        num_choices = len(self.field.choices)
        transaction = Transaction(action="add choice",
                                  label="Happy and you know it?",
                                  choice_label="possibly")
        transaction.apply_to(self.form)
        self.assertEqual(num_choices + 1, len(self.field.choices))
        self.assertTrue(any(c.label == "possibly"
                            for c in self.field.choices))

    def test_remove_choice(self):
        num_choices = len(self.field.choices)
        transaction = Transaction(action="remove choice",
                                  label="Happy and you know it?",
                                  choice_label="no")
        transaction.apply_to(self.form)
        self.assertEqual(num_choices - 1, len(self.field.choices))
        self.assertTrue(not any(c.label == "no"
                                for c in self.field.choices))

    def test_change_choice(self):
        transaction = Transaction(action="change choice",
                                  label="Happy and you know it?",
                                  choice_label="yes",
                                  to="Hell yeah!")
        transaction.apply_to(self.form)
        self.assertTrue(not any(c.label == "yes"
                                for c in self.field.choices))
        self.assertTrue(any(c.label == "Hell yeah!"
                            for c in self.field.choices))

    def test_move_choice(self):
        self.field.add_choice("maybe")
        self.field.add_choice("sure")
        self.field.add_choice("eh eh")
        num_choices = len(self.field.choices)
        transaction = Transaction(action="move choice",
                                  label="Happy and you know it?",
                                  choice_label="sure",
                                  to=0)
        transaction.apply_to(self.form)
        self.assertEqual(num_choices, len(self.field.choices))
        self.assertEqual(self.field.choices[0].label, "sure")

class TemplateTagTestCase(BaseTestCase):
    def setUp(self, *args, **kwargs):
        super(TemplateTagTestCase, self).setUp(*args, **kwargs)
        self.form.add_field("Foobar")

    def test_with_render_type(self):
        c = Context({ "form_id": self.form.id })

        t = Template("""
        {% load wysiwyg_forms_tags %}
        {% wysiwyg_form form_id "p" %}
        """)

        self.assertTrue("Foobar" in t.render(c) and "<p>" in t.render(c),
                        t.render(c))

        t = Template("""
        {% load wysiwyg_forms_tags %}
        {% wysiwyg_form form_id "ul" %}
        """)
        self.assertTrue("Foobar" in t.render(c) and "<li>" in t.render(c),
                        t.render(c))

        t = Template("""
        {% load wysiwyg_forms_tags %}
        {% wysiwyg_form form_id "table" %}
        """)
        self.assertTrue("Foobar" in t.render(c) and "<td>" in t.render(c),
                        t.render(c))

    def test_without_render_type(self):
        c = Context({ "form_id": self.form.id })
        t = Template("""
        {% load wysiwyg_forms_tags %}
        {% wysiwyg_form form_id %}
        """)
        self.assertTrue("Foobar" in t.render(c),
                        t.render(c))

    def test_with_integer(self):
        c = Context({})
        t = Template("""
        {%% load wysiwyg_forms_tags %%}
        {%% wysiwyg_form %d %%}
        """ % self.form.id)
        self.assertTrue("Foobar" in t.render(c),
                        t.render(c))

    def test_with_variable(self):
        c = Context({ "form_id": self.form.id })
        t = Template("""
        {% load wysiwyg_forms_tags %}
        {% wysiwyg_form form_id %}
        """)
        self.assertTrue("Foobar" in t.render(c),
                        t.render(c))
