from django.contrib import admin
from django.utils.translation import ugettext_lazy as _

from models import Form, Field, Choice

class FieldInline(admin.TabularInline):
    model = Field
    extra = 0

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 0

class FormAdmin(admin.ModelAdmin):
    
    def show_form(self, obj):
        return unicode(obj)
    show_form.short_description = _('form')
    
    def count_fields(self, obj):
        return len(obj.fields)
    count_fields.short_description = _('fields')
    
    
    list_display = ('show_form', 'count_fields', 'description')
    search_fields = ('name', 'description')
    
    inlines = [FieldInline,]

admin.site.register(Form, FormAdmin)

class FieldAdmin(admin.ModelAdmin):
    list_display = ('slug', 'label', 'form', 'position', 'required', 'type', 'widget')
    search_fields = ('slug', 'label',)
    list_filter = ('form', 'type', 'widget')
    list_editable = ('form', 'position', )

    inlines = [ChoiceInline,]

admin.site.register(Field, FieldAdmin)

class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('label', 'field', 'position')
    search_fields = ('name', 'description')
    list_filter = ('label', 'field')
    list_editable = ('field', 'position', )

admin.site.register(Choice, ChoiceAdmin)

