# Django WYSIWYG Forms

## What is this?

Django WYSIWYG Forms is a Django app that allows normal users to create forms
using a What You See Is What You Get style interface (similar to Wufoo or Google
Docs) and then gives programmers access to those user created forms as
`django.forms.Form` classes and instances. After that, the world is your oyster!

## Installing

Install via pip:

    pip install django-wysiwyg-forms

or from source:

    git clone git://github.com/fitzgen/django-wysiwyg-forms.git
    cd django-wysiwyg-forms/
    python setup.py install

Then, add `"wysiwyg_forms"` to `INSTALLED_APPS` in `settings.py`.

Sync the database:

    ./manage.py syncdb

Make sure that `django.contrib.staticfiles` is installed
properly. [See here for instructions](https://docs.djangoproject.com/en/dev/howto/static-files/).

Collect the static files:

    ./manage.py collectstatic

Include the urls:

    urlpatterns = patterns("",
        # ...
        (r"^wysiwyg_forms/", include("wysiwyg_forms.urls")),
        # ...
    )

## TODO

* Publish to PyPI

* Check settings.DEBUG for whether to use a dynamic require() in UI or to load a
  prebuilt/optimized version of the JS

* Export answers to forms as CSV
