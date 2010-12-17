from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template

from .views import ApplyTransactions, Edit

urlpatterns = patterns(
    '',
    url(r"^save/$", ApplyTransactions, name="wysiwyg_forms_apply_transactions"),
    url(r"^$", Edit, name="wysiwyg_forms_new_form"),
    url(r"^(\d+)/$", Edit, name="wysiwyg_forms_edit_form"),

    url(r"^dwf.js$", direct_to_template,
        { "template": "wysiwyg_forms/dwf.js",
          "mimetype": "text/javascript" },
        name="wysiwyg_forms_dwf_js"),

    url(r"^dwf.css$", direct_to_template,
        { "template": "wysiwyg_forms/dwf.css",
          "mimetype": "text/css" },
        name="wysiwyg_forms_dwf_css")
)
