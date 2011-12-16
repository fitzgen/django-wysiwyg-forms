# Django WYSIWYG Forms

*Note: this project is not production ready at this time. Stay tuned for
 updates.*

## Install:

    git clone git://github.com/fitzgen/django-wysiwyg-forms.git
    cd django-wysiwyg-forms/
    python setup.py install
    cd path/to/your/media # Accessible from MEDIA_URL
    ln -s wysiwyg_forms path/to/django-wysiwyg-forms/wysiwyg_forms/media/wysiwyg_forms

Add "wysiwyg_forms" to INSTALLED_APPS in settings.py.

Sync the database:

    ./manage.py syncdb

Include the urls:

    urlpatterns = patterns("",
        # ...
        (r"^wysiwyg_forms/", include("wysiwyg_forms.urls")),
        # ...
    )

## TODO

* Apply selected patches from other branches

* Initializing exisitng form fields in the UI

* Add required field management to the UI

* Add choices to the UI

* Rearranging positions and order in UI

* Changing the type and widget of a field in the UI

* Make the prompt a modal html window in the UI

* Start using Django 1.3's class based views

* Start using django.contrib.staticfiles in Django 1.3
