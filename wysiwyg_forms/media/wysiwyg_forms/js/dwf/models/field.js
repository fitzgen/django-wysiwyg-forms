define(function (require, exports, module) {
    var transactions = require('dwf/transactions');
    var util = require('dwf/util');
    var Choice = require('dwf/models/choice').Choice;
    var fieldTypes = require('dwf/field-types');

    var Field = exports.Field = function (initialData) {
        this._label = initialData.label;
        this._type = initialData.type;
        this._widget = initialData.widget;
        this._helpText = initialData.help_text;
        this._required = initialData.required;
        this._position = initialData.position;

        this._choices = [];
        for ( var i = 0, len = initialData.choices.length; i < len; i++ ) {
            this._choices.push(new Choice(initialData.choices[i], this));
        }
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

        if ( !fieldTypes.hasChoices() ) {
            this._choices = [];
        }
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

    Field.prototype._sortChoices = function () {
        this._choices.sort(function (choiceA, choiceB) {
            return choiceA.position() - choiceB.position();
        });
    };

    // Returns a list of [name, label] pairs.
    Field.prototype.choices = function () {
        var labels = [];
        this.eachChoice(function (c) {
            labels.push([c.label().replace(' ', '_').replace(/\W/g, ''),
                         c.label()]);
        });
        return labels;
    };

    Field.prototype.addChoice = function (label) {
        var c = new Choice({
            label: label,
            position: this._choices.length
        }, this);
        this._choices.push(c);

        transactions.addTransaction({
            action: 'add choice',
            label: this.label(),
            choice_label: label
        });
    };

    Field.prototype.getChoiceByLabel = function (label) {
        var c = null;
        this.eachChoice(function (choice) {
            if ( choice.label() === label ) {
                c = choice;
                return false;
            }
        });
        return c;
    };

    Field.prototype.deleteChoice = function (label) {
        var choice, idx;

        this.eachChoice(function (c, i) {
            if ( c.label() === label ) {
                choice = c;
                idx = i;
                return false;
            }
        });

        if ( choice ) {
            this._choices.splice(idx, 1);
            transactions.addTransaction({
                action: 'remove choice',
                label: this.label(),
                choice_label: label
            });

            // Update the positions of all the choices so there are no gaps.
            this._sortChoices();
            for ( var i = 0, len = this._choices.length; i < len; i++ ) {
                this._choices[i].position(i);
            }
        }

        else {
            throw Error('Can\'t delete a choice that doesn\'t exist');
        }
    };

    // Call the function `fn` for each choice for this field. `ctx` is the
    // optional `this` context for the function. This ensures that the choices
    // are in correct order while iterating over them.
    //
    // `fn` is passed two params: the choice and the choice's index. Return
    // `false` to break out of the loop early.
    Field.prototype.eachChoice = function (fn, ctx) {
        var i = 0;
        var len = this._choices.length;
        var ret = true;
        ctx = ctx || {};

        this._sortChoices();

        for ( ; i < len && ret !== false; i++) {
            ret = fn.call(ctx, this._choices[i], i);
        }
    };
});
