define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;

    var FieldSettingsTab = exports.FieldSettingsTab = function () {};
    FieldSettingsTab.prototype = new View();
    FieldSettingsTab.prototype._template = require('text!dwf/views/field-settings-tab.html');

    FieldSettingsTab.prototype.addListeners = function (lib) {
        function updateFieldLabel (event) {
            lib.updateActiveFieldLabel(this.value);
        }
        $(this.element).find('#DWF-edit-field-label')
            .keyup(updateFieldLabel)
            .change(updateFieldLabel);

        function updateFieldHelpText (event) {
            lib.updateActiveFieldHelpText($(this).val());
        }
        $(this.element).find('#DWF-edit-field-help-text')
            .keyup(updateFieldHelpText)
            .change(updateFieldHelpText);

        $('#DWF-no-fields-msg', this.element).find('a').click(lib.openAddFieldTab);
    };

    FieldSettingsTab.prototype.show = function () {
        $(this.element).find('#DWF-edit-field').hide();
        $(this.element).find('#DWF-no-fields-msg').hide();
        $(this.element).find('#DWF-none-selected-msg').hide();

        if ( this.lib.activeFieldExists() ) {
            $(this.element)
                .find('#DWF-edit-field-label')
                .val(this.lib.getActiveFieldLabel());
            $(this.element)
                .find('#DWF-edit-field-help-text')
                .val(this.lib.getActiveFieldHelpText());
            $(this.element).find('#DWF-edit-field').show();
        } else if ( this.lib.noFieldsExist() ) {
            $(this.element).find('#DWF-no-fields-msg').show()
        } else {
            $(this.element).find('#DWF-none-selected-msg').show();
        }

        View.prototype.show.call(this);
    };
});
