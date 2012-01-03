define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var fieldTypes = require('dwf/field-types');
    var util = require('dwf/util');

    var FieldSettingsTab = exports.FieldSettingsTab = function () {};
    FieldSettingsTab.prototype = new View();
    FieldSettingsTab.prototype._template = require('text!dwf/views/field-settings-tab.html');

    FieldSettingsTab.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        // Add all the different types of fields to the dropdown box which lets
        // you select the field's type.
        fieldTypes.eachFieldType(function (fieldType) {
            this._elements.editFieldType.append('<option value="'
                                                + fieldType.fieldType + '--'
                                                + fieldType.widget + '">'
                                                + fieldType.description + '</option>');
        }, this);
    };

    FieldSettingsTab.prototype._elements = {
        editFieldLabel: '#DWF-edit-field-label',
        editFieldHelpText: '#DWF-edit-field-help-text',
        editFieldRequired: '#DWF-edit-field-required',
        editField: '#DWF-edit-field',
        noFieldsMsg: '#DWF-no-fields-msg',
        noneSelectedMsg: '#DWF-none-selected-msg',
        editFieldType: '#DWF-edit-field-type',
        editFieldChoices: '#DWF-edit-field-choices'
    };

    FieldSettingsTab.prototype.addListeners = function (lib) {
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
        this._elements.editFieldType.change(util.bind(function () {
            var val = this._elements.editFieldType
                .find('option:selected')
                .val()
                .split('--');
            var type = val[0];
            var widget = val[1];
            lib.updateActiveFieldType(type);
            lib.updateActiveFieldWidget(widget);
            this._maybeShowChoices(type);
        }, this));

        // Listen for people deleting choices.
        this._elements.editFieldChoices.on('click', '.DWF-delete', function (event) {
            lib.deleteChoice($(event.target).parent().find('input').val());
            $(event.target).parent().remove();
        });

        // Listen to the click of the add choice button.
        this._elements.editFieldChoices.on('click', 'button', util.bind(function () {
            lib.addChoice(function (label) {
                this._addChoice(label);
            }, this);
        }, this));

        // Listen for the updating of choices.
        this._elements.editFieldChoices.on('keyup change', 'input', util.bind(function (event) {
            var choices = [];
            this._elements.editFieldChoices.find('input').each(function () {
                choices.push(this.value);
            });
            lib.updateActiveFieldChoices(choices);
        }, this));

        // Make the link to add a field if none exist work.
        this._elements.noFieldsMsg.find('a').click(lib.openAddFieldTab);
    };

    FieldSettingsTab.prototype._maybeShowChoices = function (type) {
        // If this field type supports choices, initialize the stuff for
        // editing choices, otherwise hide it.
        if ( fieldTypes.hasChoices(type) ) {
            this._initializeChoices();
            this._elements.editFieldChoices.show();
        }
        else {
            this._elements.editFieldChoices.hide();
        }
    };

    FieldSettingsTab.prototype._addChoice = function (label) {
        this._elements.editFieldChoices.find('ul')
            .append('<li><span class="DWF-delete" title="Delete this choice">X</span>'
                    + '<input type="text" value="' + label + '" /></li>');
    };

    FieldSettingsTab.prototype._initializeChoices = function () {
        this._elements.editFieldChoices.find('ul').contents().remove();

        var choices = this.lib.getActiveFieldChoices();
        for ( var i = 0, len = choices.length; i < len; i++ ) {
            this._addChoice(choices[i][1]);
        }
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

            this._maybeShowChoices(type);
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
