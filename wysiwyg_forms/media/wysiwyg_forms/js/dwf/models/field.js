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
        this._position = initialData.position;
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

    Field.prototype.required = util.getSetter('_required', function (val) {
        transactions.addTransaction({
            action : "change field required",
            label  : this.label(),
            to     : Boolean(val)
        });
    });

    Field.prototype.type = util.getSetter('_type', function (val) {
        transactions.addTransaction({
            action : "change field type",
            label  : this.label(),
            to     : val
        });
        // TODO: if the new type doesn't have choices, delete them.
    });

    Field.prototype.widget = util.getSetter('_widget', function (val) {
        transactions.addTransaction({
            action : "change field widget",
            label  : this.label(),
            to     : val
        });
    });

    Field.prototype.position = util.getSetter('_position', function (val) {
        transactions.addTransaction({
            action : "move field",
            label  : this.label(),
            to     : Math.floor(Number(val))
        });
    });

    Field.prototype.choices = util.getSetter('_choices', function (val) {
        // TODO: transaction here or maybe add Choice model
    });
});
