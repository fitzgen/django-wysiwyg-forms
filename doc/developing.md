# Developing

## Installing for development

    git clone git://github.com/fitzgen/django-wysiwyg-forms.git
    cd django-wysiwyg-forms/
    python setup.py develop

Add `"wysiwyg_forms"` to `INSTALLED_APPS` in `settings.py`.

Migrate the database:

    ./manage.py migrate

Make sure that `django.contrib.staticfiles` is installed
properly. [See here for instructions](https://docs.djangoproject.com/en/dev/howto/static-files/).

Link the static files rather than copy them:

    ./manage.py collectstatic --link

Include the URLs:

    urlpatterns = patterns("",
        # ...
        (r"^wysiwyg_forms/", include("wysiwyg_forms.urls")),
        # ...
    )

Include the static URLs:

    from django.contrib.staticfiles.urls import staticfiles_urlpatterns
    urlpatterns += staticfiles_urlpatterns()

## See also

* Overview of the [client side code](./client-side-code.md)

* How to run the [tests](./testing.md)

* The [transaction language](./transactions.md) used to communicate between the
  server and client.
