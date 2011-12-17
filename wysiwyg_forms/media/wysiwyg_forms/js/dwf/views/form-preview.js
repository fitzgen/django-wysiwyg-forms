define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var FieldPreview = require('dwf/views/field-preview').FieldPreview;
    var widgets = require('dwf/widgets');
    var util = require('dwf/util');

    var FormPreview = exports.FormPreview = function () {};
    FormPreview.prototype = new View();
    FormPreview.prototype._template = require('text!dwf/views/form-preview.html');

    FormPreview.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        this.activeField = null;
        this._fields = [];

        this._elements = {
            name: $(this.element).find('#DWF-form-name'),
            description: $(this.element).find('#DWF-form-description'),
            fields: $(this.element).find('#DWF-form-fields')
        };
    };

    FormPreview.prototype.displayFormName = function (val) {
        this._elements.name.text(val);
    };

    FormPreview.prototype.displayFormDescription = function (val) {
        this._elements.description.text(val);
    };

    FormPreview.prototype.displayActiveFieldLabel = function (val) {
        if ( this.activeField ) {
            this.activeField.displayLabel(val);
        }
        else {
            throw new TypeError('No active field');
        }
    };

    FormPreview.prototype.displayActiveFieldHelpText = function (val) {
        if ( this.activeField ) {
            this.activeField.displayHelpText(val);
        }
        else {
            throw new TypeError('No active field');
        }
    };

    FormPreview.prototype.displayActiveFieldRequired = function (val) {
        if ( this.activeField ) {
            this.activeField.displayRequired(val);
        }
        else {
            throw new TypeError('No active field');
        }
    };

    FormPreview.prototype.addField = function (field) {
        var f = new FieldPreview();
        this._fields.push(f);

        f.activate(this._elements.fields[0], $.extend({}, this.lib, {
            activateField: util.bind(function (label) {
                this.activeField = f;
                for ( var i = 0, len = this._fields.length; i < len; i++ ) {
                    if ( this._fields[i] !== this.activeField ) {
                        this._fields[i].deactivateField();
                    }
                }
                this.lib.activateField(label);
            }, this)
        }));

        f.displayRequired(field.required());
        f.displayLabel(field.label());
        f.displayHelpText(field.helpText());
        f.displayWidget(field.widget(), field.choices());
    };
});
