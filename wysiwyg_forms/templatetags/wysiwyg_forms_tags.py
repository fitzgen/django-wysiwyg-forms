from django import template
from ..models import Form

register = template.Library()

class WysiwygFormNode(template.Node):
    def __init__(self, form_id, render_type):
        self.form_id = form_id
        self.render_type = render_type

    def render(self, context):
        if self.form_id in context:
            form_id = context[self.form_id]
        elif self.form_id.isdigit():
            form_id = int(self.form_id)
        else:
            return ""

        try:
            form = Form.objects.get(pk=form_id)
        except Form.DoesNotExist:
            return ""

        form = form.as_django_form()

        request = context.get("request")
        if request and request.method == "POST":
            form = form(request)
        else:
            form = form()

        render_method = getattr(form, "as_%s" % self.render_type[1:-1], lambda: "")
        return render_method()

@register.tag("wysiwyg_form")
def do_wysiwyg_form(parser, token):
    render_type = "'ul'"
    try:
        tag_name, form_id = token.split_contents()
    except ValueError:
        try:
            tag_name, form_id, render_type = token.split_contents()
        except ValueError:
            raise template.TemplateSyntaxError("%r tag requires one or two arguments" % token.contents.split()[0])
    if not (render_type[0] == render_type[-1] and render_type[0] in ("'", '"')):
        raise template.TemplateSyntaxError("%r's second argument must be a string")
    return WysiwygFormNode(form_id, render_type)
