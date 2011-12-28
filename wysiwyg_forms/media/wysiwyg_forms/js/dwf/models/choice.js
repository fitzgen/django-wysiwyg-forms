define(function (require, exports, module) {
    var transactions = require('dwf/transactions');
    var util = require('dwf/util');

    var Choice = exports.Choice = function (initialData, field) {
        this._label = initialData.label;
        this._position = initialData.position;
        this._field = field;
    };

    Choice.prototype.label = util.getSetter('_label', function (newVal, oldVal) {
        transactions.addTransaction({
            action: 'change choice',
            label: this._field.label(),
            choice_label: oldVal,
            to: newVal
        });
    });

    Choice.prototype.position = util.getSetter('_position', function (newVal, oldVal) {
        if ( newVal !== oldVal ) {
            transactions.addTransaction({
                action: 'move choice',
                label: this._field.label(),
                choice_label: this.label(),
                to: Number(newVal)
            });
        }
    });
});
