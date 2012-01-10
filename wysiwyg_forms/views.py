from django import http
from django import template
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.shortcuts import get_object_or_404
from django.template import RequestContext
from django.utils import simplejson as json
from django.views.generic import DetailView, FormView

from .exceptions import WysiwygFormsException
from .models import Form
from .transactions import Transaction

__all__ = ("ApplyTransactions", "Edit", "WysiwygFormView")

class ApplyTransactions(DetailView):
    queryset = Form.objects.all()
    context_object_name = "form"
    http_method_names = ["post"]

    def __init__(self, *args, **kwargs):
        super(ApplyTransactions, self).__init__(*args, **kwargs)
        self.error = None
        self.post = self.get

    def render_to_response(self, context):
        return http.HttpResponse(json.dumps(context, cls=Form.JSONEncoder),
                                 content_type="application/json",
                                 status=self.get_status())

    def get_object(self, **kwargs):
        form = super(ApplyTransactions, self).get_object(**kwargs)
        try:
            for t in json.loads(self.request.POST.get("transactions", "[]")):
                # Force non-unicode keys for older Pythons
                tt = dict(zip((str(k) for k in t.iterkeys()),
                              (v for v in t.itervalues())))
                Transaction(**tt).apply_to(form)
            form.save()
        except WysiwygFormsException, e:
            self.error = e
        return form

    def get_context_data(self, **kwargs):
        context = super(ApplyTransactions, self).get_context_data(**kwargs)
        if self.error:
            return { "error": self.error.message }
        else:
            return context["form"]

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

class WysiwygFormView(FormView):
    """
    A thin wrapper around `django.views.generic.FormView`. Provide `form_id` to
    specify which `wysiwyg_forms.models.Form` instance to render as a Django
    form. A good place to hook in your own functionality is by subclassing this
    class and overriding/extending the `form_valid` method. Look in to
    `django.views.generic.FormView` for more.

    Example usage:

        urlpatterns = patterns("",
            # ...
            url(r"^foo/$",
                WysiwygFormView.as_view(form_id=42,
                                        template_name="my_app/template.html",
                                        success_url=reverse("my_success_view")),
                name="my_form_view")
            )
    """
    form_id = None

    def get_form_class(self):
        if self.form_id:
            return Form.objects.get(pk=self.form_id).as_django_form()
        else:
            raise ImproperlyConfigured(
                "Don't know how to find the correct WYSIWYG form for this view. Provide form_id.")
