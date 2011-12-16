from django.conf.urls.defaults import *
from django.views.generic.simple import direct_to_template

from .views import ApplyTransactions, Edit

urlpatterns = patterns(
    '',
    url(r"^save/$", ApplyTransactions, name="wysiwyg_forms_apply_transactions"),
    url(r"^$", Edit, name="wysiwyg_forms_new_form"),
    url(r"^(\d+)/$", Edit, name="wysiwyg_forms_edit_form"),

    # This file cannot be {% included %} because it contains "</script>" in a
    # string which breaks the rest of the JS.
    url(r"media/jquery.ba-hashchange.js",
        direct_to_template,
        { "template" : "wysiwyg_forms/jquery.ba-hashchange.min.js",
          "mimetype" : "text/javascript" },
        name="wysiwyg_forms_media_hashchange_js"),
)
