# Django WYSIWYG Forms

*Note: this project is not production ready at this time. Stay tuned for
 updates.*

### Install:

    cd path/to/your/django/project
    git clone git://github.com/wwu-housing/django-wysiwyg-forms.git wysiwyg_forms
    cd path/to/your/media/directory
    ln -s wysiwyg_forms path/to/your/django/project/wysiwyg_forms/media/wysiwyg_forms

Add "wysiwyg_forms" to INSTALLED_APPS in settings.py.

Sync the database:

    ./manage.py syncdb

Include the urls:

    urlpatterns = patterns("",
        # ...
        (r"^wysiwyg_forms/", include("wysiwyg_forms.urls")),
        # ...
    )


TODO
----

* Apply selected patches from other branches

* Initializing exisitng form fields in the UI

* Add required field management to the UI

* Add choices to the UI

* Rearranging positions and order in UI

* Changing the type and widget of a field in the UI

* Make the prompt a modal html window in the UI

* Start using Django 1.3's class based views

* Start using django.contrib.staticfiles in Django 1.3
