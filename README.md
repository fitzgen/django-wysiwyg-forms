# Django WYSIWYG Forms

## What is this?

Django WYSIWYG Forms is a Django app that allows normal users to create forms
using a What You See Is What You Get style interface (similar to Wufoo or Google
Docs) and then gives programmers access to those user created forms as
`django.forms.Form` classes and instances. After that, the world is your oyster!

## Installing

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

* Start using Django 1.3's class based views

* Start using django.contrib.staticfiles in Django 1.3

* Publish to PyPI

* Export answers to forms as CSV
