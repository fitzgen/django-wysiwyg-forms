from django import http
from django import template
from django.utils import simplejson as json

from .models import Form
from .transactions import Transaction

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
        if self.has_permissions(request, *args, **kwargs):
            content = self.get_content(request, *args, **kwargs)
            mimetype = self.get_mimetype(request, *args, **kwargs)
            return http.HttpResponse(content, mimetype=mimetype)
        else:
            return http.HttpResponseForbidden("Forbidden")

    def get_content(self, request, *args, **kwargs):
        context = self.get_context(request, *args, **kwargs)
        return self.get_template().render(context)

    def get_template(self):
        return template.loader.get_template(self.template_name)

    def has_permissions(self, request, *args, **kwargs):
        """
        Subclass and overload this method for custom authorization.
        """
        return True

def deunicode(d):
    """
    Make keys in a dict a normal str.
    """
    for k in d.keys():
        d[str(k)] = d.pop(k)

class ApplyTransactions(WysiwygFormView):
    def has_permissions(self, request, *args, **kwargs):
        return request.method == "POST"

    def get_mimetype(self, request, *args, **kwargs):
        return "application/json"

    def get_content(self, request, *args, **kwargs):
        form_id = request.POST.get("form_id")
        if not form_id:
            return json.dumps({ "error": "No form id." })
        else:
            form = Form.objects.get(id=form_id)
            for t in json.loads(request.POST.get("transactions", "[]")):
                # json.loads makes the keys in the dict be unicode, which causes
                # __init__ to fail.
                deunicode(t)
                Transaction(**t).apply_to(form)
            form.save()
            return form.as_json()
