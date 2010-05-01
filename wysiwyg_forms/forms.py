from django import forms

def build_form(form_dict):
    """
    Builds a Django form class from a dictionary.
    """
    # Get the class name.
    class_name = form_dict.pop("name")

    # Get the description.
    description = form_dict.get("description", None)

    # Convert field definition strings into Field objects.
    fields = {}

    for field_definition in form_dict["fields"]:
        field_name = field_definition.pop("name_")
        field_type = field_definition.pop("type_")

        # Convert field argument strings into objects where necessary.
        # TODO: this process should be recursive to handle most cases.
        for arg, value in field_definition.items():
            if isinstance(value, dict) and "type_" in value:
                field_definition[arg] = getattr(forms, value.pop("type_"))(**value)

        field = getattr(forms, field_type)(**field_definition)
        fields[field_name] = field

    # Create the form from the class name and Field objects.
    form = type(class_name, (forms.Form,), fields)

    # If there is a description set it as the doc string.
    if description:
        form.__doc__ = description

    return form

if __name__ == "__main__":
    form_dict = {"name": "ContactForm",
                 "description": "This is a form for contacting people",
                 "fields": [{"name_": "subject",
                             "type_": "CharField",
                             "max_length": 50,
                             "required": False},
                            {"name_":"message",
                             "type_": "CharField",
                             "max_length": 50,
                             "required": False,
                             "widget": {"type_": "Textarea"}},
                            {"name_": "what-do-you-think",
                             "label": "What do you think?",
                             "type_": "ChoiceField",
                             "choices": [("yes","yes"),
                                         ("no","no"),
                                         ("maybe","maybe")],
                             "widget": {"type_": "RadioSelect",}},
                            {"name_": "woooooo",
                             "type_": "MultipleChoiceField",
                             "choices": [("yes","yes"),
                                         ("no","no"),
                                         ("maybe","maybe")],
                             "widget": {"type_": "CheckboxSelectMultiple",}}]}
    form = build_form(form_dict)
    instance = form()
    print form.__name__
    print instance.__doc__
    print instance
