define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var FIELD_TYPES = require('dwf/field-types').FIELD_TYPES;

    var FieldSettingsTab = exports.FieldSettingsTab = function () {};
    FieldSettingsTab.prototype = new View();
    FieldSettingsTab.prototype._template = require('text!dwf/views/field-settings-tab.html');

    FieldSettingsTab.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        // Add all the different types of fields to the dropdown box which lets
        // you select the field's type.
        for ( var i = 0, len = FIELD_TYPES.length; i < len; i++ ) {
            this._elements.editFieldType.append('<option value="'
                                                + FIELD_TYPES[i].fieldType + '--'
                                                + FIELD_TYPES[i].widget + '">'
                                                + FIELD_TYPES[i].description + '</option>');
        }
    };

    FieldSettingsTab.prototype.addListeners = function (lib) {
        this._elements = {
            editFieldLabel: $(this.element).find('#DWF-edit-field-label'),
            editFieldHelpText: $(this.element).find('#DWF-edit-field-help-text'),
            editFieldRequired: $(this.element).find('#DWF-edit-field-required'),
            editField: $(this.element).find('#DWF-edit-field'),
            noFieldsMsg: $(this.element).find('#DWF-no-fields-msg'),
            noneSelectedMsg: $(this.element).find('#DWF-none-selected-msg'),
            editFieldType: $(this.element).find('#DWF-edit-field-type')
        };

        // Listen for users updating the label
        function updateFieldLabel (event) {
            lib.updateActiveFieldLabel(this.value);
        }
        this._elements.editFieldLabel
            .keyup(updateFieldLabel)
            .change(updateFieldLabel);

        // Listen for users updating the help text
        function updateFieldHelpText (event) {
            lib.updateActiveFieldHelpText($(this).val());
        }
        this._elements.editFieldHelpText
            .keyup(updateFieldHelpText)
            .change(updateFieldHelpText);

        // Listen for users changing whether the field is required or not.
        this._elements.editFieldRequired.change(function () {
            lib.updateActiveFieldRequired(this.checked);
        });

        // Listen for users changing the type of a field.
        this._elements.editFieldType.change(function () {
            var val = $(this).find('option:selected').val().split('--');
            var type = val[0];
            var widget = val[1];
            lib.updateActiveFieldType(type);
            lib.updateActiveFieldWidget(widget);
        });

        // Make the link to add a field if none exist work.
        this._elements.noFieldsMsg.find('a').click(lib.openAddFieldTab);
    };

    FieldSettingsTab.prototype.show = function () {
        this._elements.editField.hide();
        this._elements.noFieldsMsg.hide();
        this._elements.noneSelectedMsg.hide();

        if ( this.lib.activeFieldExists() ) {
            // Make sure the inputs have the correct initial values for the
            // selected form field before we show the inputs.

            // Label and help text
            this._elements.editFieldLabel
                .val(this.lib.getActiveFieldLabel());
            this._elements.editFieldHelpText
                .val(this.lib.getActiveFieldHelpText());

            // Required or not
            if ( this.lib.getActiveFieldRequired() ) {
                this._elements.editFieldRequired.attr('checked', true)
            } else {
                this._elements.editFieldRequired.removeAttr('checked')
            }

            // Field type and widget combination
            var type = this.lib.getActiveFieldType();
            var widget = this.lib.getActiveFieldWidget();
            var val = type + '--' + widget;
            this._elements.editFieldType.find('option').each(function (i, el) {
                if ( el.value === val ) {
                    el.selected = 'selected';
                    return false;
                }
            });

            $(this.element).find('#DWF-edit-field').show();
        }

        else if ( this.lib.noFieldsExist() ) {
            this._elements.noFieldsMsg.show()
        }

        else {
            this._elements.noneSelectedMsg.show();
        }

        View.prototype.show.call(this);
    };
});
