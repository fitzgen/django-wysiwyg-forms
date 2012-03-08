# Users' Guide

## Installing

See the [README](../README.md)

## Integrating WYSIWYG Forms and your project

### URLs

The default URLs looks like this and provide no permission checking:

* `wysiwyg_forms/` - Create and edit a new WYSIWYG form.

* `wysiwyg_forms/<pk>/` - Edit the form with primary key `<pk>`.

* `wysiwyg_forms/save/<pk>/` - Where POSTs go to save a given form.

#### Integrating with django.contrib.auth permissions

If you wanted to make sure that only users with the `wysiwyg_forms.add_form`
permission can create forms and the `wysiwyg_forms.change_form` permission was
required to edit forms, instead of including the default URLs you would add this
to your project's URLs:

    from wysiwyg_forms.views import ApplyTransaction, Edit

    urlpatterns = patterns(
        # ...
        url(r"^my_wysiwyg_forms/save/(?P<pk>\d+)/$",
            permission_required("wysiwyg_forms.change_form")(ApplyTransaction.as_view()),
            name="my_wysiwyg_save"),
        url(r"^my_wysiwyg_forms/$",
            permission_required("wysiwyg_forms.add_form")(Edit.as_view(save_view_name="my_wysiwyg_save")),
            name="my_wysiwyg_new),
        url(r"^my_wysiwyg_forms/(?P<pk>\d+)/$",
            permission_required("wysiwyg_forms.add_form")(Edit.as_view(save_view_name="my_wysiwyg_save")),
            name="my_wysiwyg_edit),
        # ...
    )

### Views

#### `wysiwyg_forms.views.WysiwygFormView`

This is a generic view that gives you a WYSIWYG form as a normal django form. It
is a thin wrapper around `django.views.generic.FormView`. Provide `form_id` to
specify which `wysiwyg_forms.models.Form` instance to render as a Django form. A
good place to hook in your own functionality is by subclassing this class and
overriding/extending the `form_valid` method. Look in to
`django.views.generic.FormView` for more.

Example usage:

    urlpatterns = patterns("",
        # ...
        url(r"^foo/$",
            WysiwygFormView.as_view(form_id=42,
                                    template_name="my_app/template.html",
                                    success_url=reverse("my_success_view")),
            name="my_form_view")
        )

##### Extending `WysiwygFormView`

If you wanted to extend `WysiwygFormView` to send off emails containing the
answers to the form's questions when a submission is successful, you could do
something like this:

    from django.core.mail import send_mail
    from wwu_housing.wysiwyg_forms.views import WysiwygFormView

    class EmailFormView(WysiwygFormView):
        recipients = None
        subject = None
        from_address = None

        def get_email_subject(self, form):
            return self.subject

        def get_email_body(self, form):
            body = []
            for key, field in form.fields.iteritems():
                body.append("**Question:** %s" % field.label)
                if field.help_text:
                    body.append(field.help_text)
                body.append("**Answer:** %s" % form.cleaned_data[key])
                body.append("---------------------------------------")
            return "\n\n".join(body)

        def get_email_recipients(self, form):
            return self.recipients

        def get_email_from_address(self, form):
            return self.from_address

        def form_valid(self, form):
            send_mail(self.get_email_subject(form),
                      self.get_email_body(form),
                      self.get_email_from_address(form),
                      self.get_email_recipients(form))
            return super(EmailFormView, self).form_valid(form)

### Template Tags

#### {% wysiwyg_form *id* *[type]* %}

Render the WYSIWYG form to HTML. `id` can be either a template context variable
or an integer and specifies which form is being rendered. `type` is optional and
either "p", "ul", or "table". It defaults to "ul".

Note that just like Django's builtin form classes, this does not render `<form>`
tags; that is up to you.
