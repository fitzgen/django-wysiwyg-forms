define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;

    var FormSettingsTab = exports.FormSettingsTab = function () {};
    FormSettingsTab.prototype = new View();
    FormSettingsTab.prototype._template = require('text!dwf/views/form-settings-tab.html');

    FormSettingsTab.prototype.addListeners = function (lib) {
        function updateFormName (event) {
            lib.updateFormName(this.value);
        }
        $(this.element).find('#DWF-form-settings-name')
            .keyup(updateFormName)
            .change(updateFormName);

        function updateFormDescription (event) {
            lib.updateFormDescription($(this).val());
        }
        $(this.element).find('#DWF-form-settings-description')
            .keyup(updateFormDescription)
            .change(updateFormDescription);

        $(this.element)
            .find('button')
            .click(function () {
                if ( ! this.disabled ) {
                    lib.saveNow();
                }
            });
    };

    FormSettingsTab.prototype.show = function () {
        View.prototype.show.call(this);

        $(this.element)
            .find('#DWF-form-settings-name')
            .val(this.lib.getFormName());
        $(this.element)
            .find('#DWF-form-settings-description')
            .val(this.lib.getFormDescription());
    };

    FormSettingsTab.prototype.disableSave = function () {
        $(this.element)
            .find('button')
            .attr('disabled', true)
            .text('Saving...');
    };

    FormSettingsTab.prototype.enableSave = function () {
        $(this.element)
            .find('button')
            .removeAttr('disabled')
            .text('Save');
    };
});
