# Testing

First of all, get Django WYSIWYG Forms installed as per the instructions
[here](./developing.md).

## Server-side Tests

To run the server side tests, do as you would test any other django app:

    python manage.py test wysiwyg_forms

## Client-side Tests

First, make sure you have `DEBUG = True` in your settings.py and that you are in
a development environment not using your production database, then start
Django's built in development server.

    python manage.py runserver

In your browser, navigate to http://127.0.0.1:8000/wysiwyg_forms/test/ and the
tests will be run automatically.
