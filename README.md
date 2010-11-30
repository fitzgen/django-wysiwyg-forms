# Django WYSIWYG Forms

*Note: this project is not production ready at this time. Stay tuned for
 updates.*

## Install:

    git clone git://github.com/fitzgen/django-wysiwyg-forms.git
    cd django-wysiwyg-forms/
    python setup.py install

Add "wysiwyg_forms" to INSTALLED_APPS in settings.py.

Sync the database:

    ./manage.py syncdb

Include the urls:

    urlpatterns = patterns("",
        # ...
        (r"^wysiwyg_forms/", include("wysiwyg_forms.urls")),
        # ...
    )

## TODO:

* Scrap existing frontend JavaScript and restart using Backbone
