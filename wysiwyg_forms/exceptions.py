class WysiwygFormsException(Exception):
    pass

class ChoiceDoesNotExist(WysiwygFormsException):
    pass

class ChoiceAlreadyExists(WysiwygFormsException):
    pass

class FieldDoesNotExist(WysiwygFormsException):
    pass

class FieldAlreadyExists(WysiwygFormsException):
    pass
