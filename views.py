from django import http
from django.core.exceptions import ImproperlyConfigured
from django import template

__all__ = ("")

class WysiwygFormView(object):
    def __new__(cls, request, *args, **kwargs):
        # XXX: Uses a little magic to keep things thread safe: __new__ returns
        # an instance of HttpResponse rather than an instance of this view.
        self = object.__new__(cls)
        self.__init__(*args, **kwargs)
        return self.view(request, *args, **kwargs)

    def view(self, request, *args, **kwargs):
        """
        Returns an HttpResponse object.
        """
        content = self.get_content(request, *args, **kwargs)
        mimetype = self.get_mimetype()
        return http.HttpResponse(content, mimetype=mimetype)

    def get_content(self, request, *args, **kwargs):
        context = self.get_context(request, *args, **kwargs)
        return self.get_template().render(context)

    def get_template(self):
        return template.loader.get_template(self.template_name)

class WysiwygFormEditor(WysiwygFormView):
    template_name = "wysiwyg_forms/edit.html"

    def __init__(self, *args, **kwargs):
        self.postback = kwargs.pop("postback")

    def get_context(self, request, *args, **kwargs):
        pass

