from django import forms

def is_valid_field_type(field_type):
    field = getattr(forms.fields, field_type, False)
    return field and issubclass(field, forms.fields.Field)

def is_valid_widget_type(widget_type):
    widget = getattr(forms.widgets, widget_type, False)
    return widget and issubclass(widget, forms.widgets.Widget)

def field_type_has_choices(field_type):
    field = getattr(forms.fields, field_type, False)
    if not field:
        return False
    else:
        return hasattr(field(), "choices")
