from django.conf import settings
from django.conf.urls.defaults import *

from django.views.generic import TemplateView

from .views import ApplyTransactions, Edit

urlpatterns = patterns(
    '',
    url(r"^save/(?P<pk>\d+)/$",
        ApplyTransactions.as_view(),
        name="wysiwyg_forms_apply_transactions"),
    url(r"^$",
        Edit.as_view(),
        name="wysiwyg_forms_new_form"),
    url(r"^(?P<pk>\d+)/$",
        Edit.as_view(),
        name="wysiwyg_forms_edit_form")
)

if settings.DEBUG:
    urlpatterns += patterns(
        '',
        url(r"^test/$",
            TemplateView.as_view(template_name="wysiwyg_forms/test.html"),
            name="wysiwyg_forms_test")
    )
