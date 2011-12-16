define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var widgets = require('dwf/widgets');

    var FormPreview = exports.FormPreview = function () {};
    FormPreview.prototype = new View();
    FormPreview.prototype._template = require('text!dwf/views/form-preview.html');

    FormPreview.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        this.activeField = null;
    };

    FormPreview.prototype.addListeners = function (lib) {
        this._elements = {
            name: $(this.element).find('#DWF-form-name'),
            description: $(this.element).find('#DWF-form-description'),
            fields: $(this.element).find('#DWF-form-fields')
        };

        var me = this;
        this._elements.fields.delegate('.DWF-field', 'click', function (event) {
            me.activeField && me.activeField.removeClass('DWF-active-field');
            me.activeField = $(this);
            me.activeField.addClass('DWF-active-field');

            lib.activateField(me.activeField.find('label > strong').text());
        });
    };

    FormPreview.prototype.displayFormName = function (val) {
        this._elements.name.text(val);
    };

    FormPreview.prototype.displayFormDescription = function (val) {
        this._elements.description.text(val);
    };

    FormPreview.prototype.displayActiveFieldLabel = function (val) {
        if ( this.activeField ) {
            this.activeField.find('label strong').text(val);
        }
        else {
            throw new TypeError('No active field');
        }
    };

    FormPreview.prototype.displayActiveFieldHelpText = function (val) {
        if ( this.activeField ) {
            this.activeField.find('div.DWF-help-text').text(val);
        }
        else {
            throw new TypeError('No active field');
        }
    };

    FormPreview.prototype.addField = function (field) {
        var attrs = { disabled: true };
        var renderedWidget = widgets[field.widget()] ?
            (new widgets[field.widget()]()).render(null, attrs, field.choices()) :
            (new widgets.TextInput()).render(null, attrs);
        this._elements.fields.append(
            "<li class='DWF-field'><label><strong>" + field.label() + "</strong>"
                + "<div class='DWF-help-text'>" + field.helpText() + "</div>"
                + renderedWidget + "</label></li>"
        );
    };
});
