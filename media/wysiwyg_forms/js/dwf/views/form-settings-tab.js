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

        // TODO: saving
        // var base = $("#DWF-base"),
        // numDots = 0;
        // base.html("<h1 style='text-align:center'>Saving</h1>");
        // setInterval(function () {
        //     return numDots > 2 ?
        //         base.text("Saving") :
        //         base.text(base.text() + ".") && numDots++;
        // }, 250);
        // $.post("{% url wysiwyg_forms_apply_transactions %}",
        //        { form_id: DWF.formId,
        //          transactions: JSON.stringify(transactions.getTransactions()) },
        //        function () {
        //            location.reload();
        //        });
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
});
