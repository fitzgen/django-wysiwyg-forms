from .exceptions import WysiwygFormsException
from .utils import field_type_has_choices, is_valid_field_type
from .models import Choice

__all__ = ("Transaction",)

class Transaction(object):
    """
    A transaction represents an atomic change that can be applied to a form with
    `apply_to`.
    """

    # This dictionary is keyed by action and has values which are functions that
    # take a transaction whose action is the same as the key and a form to apply
    # the transaction to. To add a function to this dictionary, use the
    # `@Transaction.register(some_action)` decorator.
    _action_methods = {}

    def __init__(self, **kwargs):
        self.action       = unicode(kwargs.pop("action", kwargs.pop(u"action", None)))
        self.to           = kwargs.pop("to", kwargs.pop(u"to", None))
        self.label        = kwargs.pop("label", kwargs.pop(u"label", None))
        self.choice_label = kwargs.pop("choice_label", kwargs.pop(u"choice_label", None))

        try:
            key = iter(kwargs).next()
            raise WysiwygFormsException(
                "Transaction.__init__() got unexpected keyword argument '%s'" % key
                )
        except StopIteration:
            pass

    def __unicode__(self):
        return u"<%s: %s>" % (self.__class__.__name__, self.__dict__)
    __str__ = __repr__ = __unicode__

    @classmethod
    def register(cls, action):
        """
        This decorator defines new types of Transaction actions, and specifies
        how to apply the new type of action to a form.
        """
        def registrar(fn):
            cls._action_methods[unicode(action)] = fn
            return fn
        return registrar

    def apply_to(self, form):
        """
        Apply this transaction to the given form.
        """
        fn = Transaction._action_methods.get(self.action)
        if not fn:
            raise WysiwygFormsException("Unknown action to apply to form: '%s'" % self.action)
        else:
            fn(self, form)


@Transaction.register("change name")
def apply_to(t, form):
    form.name = t.to

@Transaction.register("change description")
def apply_to(t, form):
    form.description = t.to

@Transaction.register("add field")
def apply_to(t, form):
    form.add_field(t.label)

@Transaction.register("remove field")
def apply_to(t, form):
    form.remove_field(t.label)

@Transaction.register("rename field")
def apply_to(t, form):
    form.get_field(t.label).label = t.to

@Transaction.register("change help text")
def apply_to(t, form):
    form.get_field(t.label).help_text = t.to

@Transaction.register("move field")
def apply_to(t, form):
    form.move_field(t.label, t.to)

@Transaction.register("change field type")
def apply_to(t, form):
    if not is_valid_field_type(t.to):
        raise WysiwygFormsException("Invalid field type: %s" % t.to)
    else:
        field = form.get_field(t.label)
        field.type = t.to
        if not field_type_has_choices(t.to):
            Choice.objects.filter(field=field).delete()

@Transaction.register("change field widget")
def apply_to(t, form):
    form.get_field(t.label).widget = t.to

@Transaction.register("change field required")
def apply_to(t, form):
    form.get_field(t.label).required = t.to

@Transaction.register("add choice")
def apply_to(t, form):
    form.get_field(t.label).add_choice(t.choice_label)

@Transaction.register("remove choice")
def apply_to(t, form):
    form.get_field(t.label).remove_choice(t.choice_label)

@Transaction.register("change choice")
def apply_to(t, form):
    form.get_field(t.label).get_choice(t.choice_label).label = t.to

@Transaction.register("move choice")
def apply_to(t, form):
    form.get_field(t.label).move_choice(t.choice_label, t.to)
