from django import template
from django.template.loaders.app_directories import load_template_source
 
register = template.Library()
 
def do_include_raw(parser, token):
    """ 
    Performs a template include without parsing the context, just dumps the template in.
    """
    bits = token.split_contents()
    if len(bits) != 2:
        raise TemplateSyntaxError, "%r tag takes one argument: the name of the template to be included" % bits[0]
 
    template_name = bits[1]
    if template_name[0] in ('"', "'") and template_name[-1] == template_name[0]:
        template_name = template_name[1:-1]
 
    source, path = load_template_source(template_name)
 
    return template.TextNode(source)
register.tag("include_raw", do_include_raw)
