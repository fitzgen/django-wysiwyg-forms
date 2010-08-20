from .exceptions import WysiwygFormsException

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
