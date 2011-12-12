define(function (require, exports, module) {

    // Dependencies
    var widgets      = require('dwf/widgets');
    var util         = require('dwf/util');
    var transactions = require('dwf/transactions');
    var ControlPanel = require('dwf/views/control-panel').ControlPanel;
    var FormPreview  = require('dwf/views/form-preview').FormPreview;
    var Form         = require('dwf/models/form').Form;

    // Models
    var form = new Form(JSON.parse($('#initial-form')[0].textContent));

    // Views
    var controlPanel = new ControlPanel();
    var formPreview  = new FormPreview();

    controlPanel.activate($('#DWF-base')[0], {
        addField: function (fieldType, widget) {
            util.prompt("Label:", function (label) {
                if (label) {
                    if (form.getFieldByLabel(label)) {
                        util.prompt("A field with that label already exists. Enter a new one:",
                                    arguments.callee);
                    } else {
                        form.addField(label, fieldType, widget);
                        formPreview.addField(label, widget, "", []);
                    }
                }
            });
        },

        activeFieldExists: function () {
            return form.activeField;
        },

        noFieldsExist: function () {
            return !form.hasFields();
        },

        getActiveFieldLabel: function () {
            return form.activeField.label();
        },

        getActiveFieldHelpText: function () {
            return form.activeField.helpText();
        },

        updateActiveFieldLabel: function (val) {
            form.activeField.label(val);
            formPreview.displayActiveFieldLabel(val);
        },

        updateActiveFieldHelpText: function (val) {
            form.activeField.helpText(val);
            formPreview.displayActiveFieldHelpText(val);
        },

        getFormName: function () {
            return form.name();
        },

        getFormDescription: function () {
            return form.description();
        },

        updateFormName: function (val) {
            form.name(val);
            formPreview.displayFormName(val);
        },

        updateFormDescription: function (val) {
            form.description(val);
            formPreview.displayFormDescription(val);
        }
    });

    formPreview.activate($('#DWF-base')[0], {
        activateField: function (label) {
            form.activeField = form.getFieldByLabel(label);
            controlPanel.openFieldSettingsTab();
        }
    });

    // Have the form preview display the initial form data.
    formPreview.displayFormName(form.name());
    formPreview.displayFormDescription(form.description());
    // TODO: initialize the fields

    // Start saving the form about once every minute.
    transactions.startAutoSaveLoop({
        target: document.getElementById('save-target').textContent,
        formId: form.id(),
        preSave: function () {
        },
        postSave: function () {
        },
        error: function () {
        }
    });
});
