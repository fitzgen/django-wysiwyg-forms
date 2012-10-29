from django import http
from django import template
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.urlresolvers import reverse
from django.shortcuts import get_object_or_404
from django.template import RequestContext
from django.utils import simplejson as json
from django.views.generic import DetailView, FormView

from .exceptions import WysiwygFormsException
from .models import Form
from .transactions import Transaction

__all__ = ("ApplyTransactions", "Edit", "WysiwygFormView")

class ApplyTransactions(DetailView):
    """
    This view applies the transactions from the WYSIWYG client editor to save a
    form.
    """
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
    """
    This is the view for editing a form and sends down the client side WYSIWYG
    editor. Expects `pk` as a keyword argument.
    """
    template_name = "wysiwyg_forms/edit.html"
    queryset = Form.objects.all()
    context_object_name = "form"

    # Customize `base_template_name` to change what template
    # `wysiwyg_forms/edit.html` will extend. Change this instead of
    # `template_name`.
    base_template_name = "wysiwyg_forms/base.html"

    # Customize `save_view_name` to change where the client side JS will POST
    # the transactions which save form state to.
    save_view_name = "wysiwyg_forms_apply_transactions"

    def get_object(self, queryset=None):
        try:
            form = super(Edit, self).get_object(queryset)
        except AttributeError:
            form = Form.objects.create(name="New Form",
                                       description="This is a new form.")
            self.kwargs["pk"] = form.id
        return form

    def get_save_view_url(self):
        """
        Returns the url for the view which is being used to save the form. By
        default, uses `self.save_view_name` and the id of the form being edited
        in a `django.core.urlresolvers.reverse()` look up.
        """
        return reverse(self.save_view_name, args=[self.kwargs["pk"]])

    def get_context_data(self, **kwargs):
        context = super(Edit, self).get_context_data(**kwargs)
        context["base_template_name"] = self.base_template_name
        context["debug"] = settings.DEBUG
        context["save_target"] = self.get_save_view_url()
        return context

class WysiwygFormView(FormView):
    """
    A thin wrapper around `django.views.generic.FormView`. Provide `form_id` or
    `form_slug` to specify which `wysiwyg_forms.models.Form` instance to render
    as a Django form. A good place to hook in your own functionality is by
    subclassing this class and overriding/extending the `form_valid`
    method. Look in to `django.views.generic.FormView` for more.

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
    form_slug = None

    def get_wysiwyg_form(self):
        if not (self.form_id or self.form_slug):
            raise ImproperlyConfigured(
                "Don't know how to find the correct WYSIWYG form for this view. Provide form_id or form_slug.")
        if self.form_id and self.form_slug:
            raise ImproperlyConfigured(
                "Can not provide both a form_id and a form_slug.")
        elif self.form_id:
            return Form.objects.get(pk=self.form_id)
        else:
            return Form.objects.get(slug=self.form_slug)

    def get_context_data(self, **kwargs):
        ctx = super(WysiwygFormView, self).get_context_data(**kwargs)
        wysiwyg_form = self.get_wysiwyg_form()
        ctx["form_description"] = wysiwyg_form.description
        ctx["form_name"] = wysiwyg_form.name
        return ctx

    def get_form_class(self):
        return self.get_wysiwyg_form().as_django_form()

