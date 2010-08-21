from .exceptions import WysiwygFormsException
from .utils import field_type_has_choices, is_valid_field_type

class Transaction(object):
    def __init__(self, **kwargs):
        self.action       = kwargs.pop("action", None)
        self.to           = kwargs.pop("to", None)
        self.label        = kwargs.pop("label", None)
        self.choice_label = kwargs.pop("choice_label", None)

        try:
            key = iter(kwargs).next()
            raise WysiwygFormsException(
                "Transaction.__init__() got unexpected keyword argument '%s'" % key
                )
        except StopIteration:
            pass

    def apply_to(self, form):
        if self.action == "change name":
            form.name = self.to
        elif self.action == "change description":
            form.description = self.to
        elif self.action == "add field":
            form.add_field(self.label)
        elif self.action == "remove field":
            form.remove_field(self.label)
        elif self.action == "rename field":
            form.get_field(self.label).label = self.to
        elif self.action == "change help text":
            form.get_field(self.label).help_text = self.to
        elif self.action == "move field":
            form.move_field(self.label, self.to)
        elif self.action == "change field type":
            if not is_valid_field_type(self.to):
                raise WysiwygFormsException("Invalid field type: %s" % self.to)
            else:
                field = form.get_field(self.label)
                field.type = self.to
                if not field_type_has_choices(self.to):
                    for c in field.choices:
                        c.delete()
        else:
            raise WysiwygFormsException("Unknown action to apply to form: '%s'" % self.action)
