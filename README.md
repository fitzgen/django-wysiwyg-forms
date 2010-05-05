This project isn't ready yet!

One day it will:

* Provide an {% include %}-able template that embeds a WYSIWYG form builder and
  editor.

* Send the form back to your Django app as JSON.

* Turn that JSON in to a Django form class!

You will need to:

* Run the following commands, where `$YOUR_DJANGO_MEDIA_ROOT` is the path to
  your Django MEDIA_ROOT, as defined in settings.py:

      $ git clone git://github.com/fitzgen/django-wysiwyg-forms.git
      $ cd django-wysiwyg-forms
      $ sudo python setup.py install
      $ cp wysiwyg_forms/media $YOUR_DJANGO_MEDIA_ROOT/wysiwyg_forms

* Add "wysiwyg_forms" to your INSTALLED_APPS in settings.py.

* In one of your templates, insert:

      {% with wysiwyg_forms_postback as some_url %}
          {% include "wysiwyg_forms/editor.html" %}
      {% endwith %}

* Have a strategy to save the form's JSON yourself, if you want it to
  persist. (I recommend CouchDB, MongoDB, or another JSON document store).