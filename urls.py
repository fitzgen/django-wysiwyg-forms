from django.conf.urls.defaults import *

from .views import ApplyTransactions, Edit

urlpatterns = patterns(
    '',
    url(r"^save/$", ApplyTransactions, name="wysiwyg_forms_apply_transactions"),
    url(r"^/$", Edit, name="wysiwyg_forms_new_form"),
    url(r"^(\d+)/$", Edit, name="wysiwyg_forms_edit_form"),
)
