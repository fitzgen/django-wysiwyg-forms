from django.test import TestCase

from .models import Form, Field, Choice

class BaseTestCase(TestCase):
    def setUp(self):
        self.form = Form.objects.create(name="Test Form",
                                        description="A test form")

class FormModelTestCase(BaseTestCase):
    def test_add_field(self):
        self.assertEqual(len(self.form.fields), 0,
                         "Should start with 0 fields")
        self.form.add_field("Email", type="EmailField")
        self.assertEqual(len(self.form.fields), 1,
                         "Should now have 1 field")
        self.assertTrue(isinstance(self.form.fields[0], Field),
                        "The new field should be an instance of Field.")

    def test_remove_field(self):
        self.form.add_field("Email", type="EmailField")
        self.assertEqual(len(self.form.fields), 1,
                         "Should have 1 field")
        self.form.remove_field("Email")
        self.assertEqual(len(self.form.fields), 0,
                         "Should now have 0 fields")

class FieldModleTestCase(BaseTestCase):
    pass

