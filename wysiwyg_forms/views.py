from django import http
from django import template
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.template import RequestContext
from django.utils import simplejson as json
from django.views.generic import DetailView

from .exceptions import WysiwygFormsException
from .models import Form
from .transactions import Transaction

__all__ = ("ApplyTransactions", "Edit")

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
            status = self.get_status()
            return http.HttpResponse(content, mimetype=mimetype, status=status)
        else:
            return http.HttpResponseForbidden("Forbidden")

    def get_content(self, request, *args, **kwargs):
        context = self.get_context(request, *args, **kwargs)
        return self.get_template().render(context)

    def get_template(self):
        return template.loader.get_template(self.template_name)

    def get_status(self):
        return 200

    def get_mimetype(self, request, *args, **kwargs):
        return self.mimetype

    def has_permissions(self, request, *args, **kwargs):
        """
        Subclass and overload this method for custom authorization.
        """
        return True

class ApplyTransactions(WysiwygFormView):
    mimetype = "application/json"

    def __init__(self):
        self.error = None

    def has_permissions(self, request, *args, **kwargs):
        return request.method == "POST"

    def get_content(self, request, *args, **kwargs):
        try:
            form_id = request.POST.get("form_id")
            if not form_id:
                raise WysiwygFormsException("No form id.")
            else:
                form = Form.objects.get(id=form_id)
                for t in json.loads(request.POST.get("transactions", "[]")):
                    Transaction(**t).apply_to(form)
                form.save()
                return form.as_json()
        except WysiwygFormsException, e:
            self.error = e
            return json.dumps({
                "error": e.message
            })

    def get_status(self):
        if self.error:
            return 500
        else:
            return 200

class Edit(DetailView):
    template_name = "wysiwyg_forms/edit.html"
    queryset = Form.objects.all()
    context_object_name = "form"

    # Customize `base_template_name` to change what template
    # `wysiwyg_forms/edit.html` will extend.
    base_template_name = "wysiwyg_forms/base.html"

    def get_object(self, queryset=None):
        try:
            form = super(Edit, self).get_object(queryset)
        except AttributeError:
            form = Form.objects.create(name="New Form",
                                       description="This is a new form.")
        return form

    def get_context_data(self, **kwargs):
        context = super(Edit, self).get_context_data(**kwargs)
        context["base_template_name"] = self.base_template_name
        context["debug"] = settings.DEBUG
        return context
