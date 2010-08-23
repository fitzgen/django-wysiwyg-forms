from django.conf.urls.defaults import *

from .views import ApplyTransactions

urlpatterns = patterns(
    '',
    url(r"^save/$", ApplyTransactions, name="wysiwyg_forms_apply_transactions"),
)
