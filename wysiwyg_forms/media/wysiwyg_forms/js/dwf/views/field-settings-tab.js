define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;

    var FieldSettingsTab = exports.FieldSettingsTab = function () {};
    FieldSettingsTab.prototype = new View();
    FieldSettingsTab.prototype._template = require('text!dwf/views/field-settings-tab.html');

    FieldSettingsTab.prototype.addListeners = function (lib) {
        this._elements = {
            editFieldLabel: $(this.element).find('#DWF-edit-field-label'),
            editFieldHelpText: $(this.element).find('#DWF-edit-field-help-text'),
            editFieldRequired: $(this.element).find('#DWF-edit-field-required'),
            editField: $(this.element).find('#DWF-edit-field'),
            noFieldsMsg: $(this.element).find('#DWF-no-fields-msg'),
            noneSelectedMsg: $(this.element).find('#DWF-none-selected-msg')
        };

        function updateFieldLabel (event) {
            lib.updateActiveFieldLabel(this.value);
        }
        this._elements.editFieldLabel
            .keyup(updateFieldLabel)
            .change(updateFieldLabel);

        function updateFieldHelpText (event) {
            lib.updateActiveFieldHelpText($(this).val());
        }
        this._elements.editFieldHelpText
            .keyup(updateFieldHelpText)
            .change(updateFieldHelpText);

        this._elements.editFieldRequired
            .change(function () {
                lib.updateActiveFieldRequired(this.checked);
            });

        $('#DWF-no-fields-msg', this.element).find('a').click(lib.openAddFieldTab);
    };

    FieldSettingsTab.prototype.show = function () {
        this._elements.editField.hide();
        this._elements.noFieldsMsg.hide();
        this._elements.noneSelectedMsg.hide();

        if ( this.lib.activeFieldExists() ) {
            this._elements.editFieldLabel
                .val(this.lib.getActiveFieldLabel());
            this._elements.editFieldHelpText
                .val(this.lib.getActiveFieldHelpText());
            if ( this.lib.getActiveFieldRequired() ) {
                this._elements.editFieldRequired.attr('checked', true)
            } else {
                this._elements.editFieldRequired.removeAttr('checked')
            }

            $(this.element).find('#DWF-edit-field').show();
        } else if ( this.lib.noFieldsExist() ) {
            $(this.element).find('#DWF-no-fields-msg').show()
        } else {
            $(this.element).find('#DWF-none-selected-msg').show();
        }

        View.prototype.show.call(this);
    };
});
