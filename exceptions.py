class WysiwygFormsException(Exception):
    pass

class ChoiceDoesNotExist(WysiwygFormsException):
    pass

class ChoiceAlreadyExists(WysiwygFormsException):
    pass
