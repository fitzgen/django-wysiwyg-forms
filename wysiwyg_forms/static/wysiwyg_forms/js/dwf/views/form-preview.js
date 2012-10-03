define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var FieldPreview = require('dwf/views/field-preview').FieldPreview;
    var widgets = require('dwf/widgets');
    var util = require('dwf/util');
    require('jquery-ui');

    var FormPreview = exports.FormPreview = function () {};
    FormPreview.prototype = new View();
    FormPreview.prototype._template = require('text!dwf/views/form-preview.html');

    FormPreview.prototype._elements = {
        name: '#DWF-form-name',
        description: '#DWF-form-description',
        fields: '#DWF-form-fields'
    };

    FormPreview.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        this._elements.fields.sortable({
            placeholder: 'DWF-field-placeholder',
            forcePlaceholderSize: true
        });

        this.activeField = null;
        // Not in any particular order so don't rely on this order.
        this._fields = [];
    };

    FormPreview.prototype.addListeners = function (lib) {
        this._elements.fields.bind('sortupdate', util.bind(function () {
            this._elements.fields.find('li').each(function (i, el) {
                lib.updateFieldPosition($(el).find('.DWF-field-label').text(), i);
            });
        }, this));
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

    FormPreview.prototype.displayActiveFieldWidget = function (val, choices) {
        if ( this.activeField ) {
            this.activeField.displayWidget(val, choices);
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
