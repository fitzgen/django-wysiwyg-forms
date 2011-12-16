define(function (require, exports, module) {
    var transactions = require('dwf/transactions');
    var util = require('dwf/util');

    var Field = exports.Field = function (initialData) {
        this._label = initialData.label;
        this._type = initialData.type;
        this._widget = initialData.widget;
        this._helpText = initialData.help_text;
        this._required = initialData.required;
        this._choices = initialData.choices;
    };

    Field.prototype.label = util.getSetter('_label', function (newVal, oldVal) {
        transactions.addTransaction({
            action : "rename field",
            label  : oldVal,
            to     : newVal
        });
    });

    Field.prototype.helpText = util.getSetter('_helpText', function (val) {
        transactions.addTransaction({
            action : "change help text",
            label  : this.label(),
            to     : val
        });
    });

    Field.prototype.widget = util.getSetter('_widget', function (val) {
        // TODO: transaction here
    });

    Field.prototype.choices = util.getSetter('_choices', function (val) {
        // TODO: transaction here or maybe add Choice model
    });
});
