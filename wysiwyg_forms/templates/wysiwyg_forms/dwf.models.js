/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global Backbone, _, dwf, undef */

// ### Models

dwf.models = dwf.models || {};

var missingArg = dwf.utils.missingArg,
    withNew    = dwf.utils.withNew;

dwf.models.Choice = Backbone.Model.extend({

    initialize: function (opts) {
        this.set({
            label    : opts.label    || missingArg("dwf.models.Choice", "label"),
            position : opts.position || missingArg("dwf.models.Choice", "position")
        });
    },

    slug: function () {
        return dwf.utils.slugify(this.get("label"));
    }

});

dwf.models.ChoiceSet = Backbone.Collection.extend({
    model: dwf.models.Choice
});

dwf.models.Field = Backbone.Model.extend({

    initialize: function (opts) {
        this.set({
            label    : opts.label    || missingArg("dwf.models.Field", "label"),
            type     : opts.type     || missingArg("dwf.models.Field", "type"),
            widget   : opts.widget   || missingArg("dwf.models.Field", "widget"),
            help     : opts.help     || missingArg("dwf.models.Field", "help"),
            position : opts.position || missingArg("dwf.models.Field", "position"),
            required : opts.required || missingArg("dwf.models.Field", "required")
        });

        this.choices = new dwf.models.ChoiceSet(
            opts.choices === undef
                ? []
                : _.map(opts.choices, function (pair, pos) {
                    return new dwf.models.Choice({
                        label    : pair[1],
                        position : pos
                    });
                })
        );
    },

    slug: function () {
        return dwf.utils.slugify(this.get("label"));
    },

    ensureChoicePositions: function () {
        var i = 0;
        for ( ; i < this.choices.length; i++ ) {
            this.choices.at(i).position = i;
        }
        return this;
    },

    supportsChoices: function () {
        throw new Error("TODO");
    },

    addChoice: function (choice) {
        if ( this.supportsChoices() ) {
            // TODO: check to make sure that there isn't a choice with this
            // label already.
            this.choices.add(choice);
            return this;
        } else {
            throw new TypeError(this.type + " does not support choices.");
        }
    },

    removeChoice: function (choice) {
        this.choices.remove(choice);
        this.ensureChoicePositions();
        return this;
    },

    moveChoice: function (choice, index) {
        choice.set({ position: index });
        this.choices.sort();
        this.ensureChoicePositions();
        return this;
    }

});

dwf.models.FieldSet = Backbone.Collection.extend({
    model: dwf.models.Field,
    comparator: function () {}
});

dwf.models.Form = Backbone.Model.extend({

    initialize: function (opts) {
        this.set({
            id          : opts.id          || null,
            name        : opts.name        || missingArg("dwf.models.Form", "name"),
            description : opts.description || missingArg("dwf.models.Form", "description")
        });

        this.fields = new dwf.models.FieldSet(
            opts.fields === undef
                ? missingArg("dwf.models.Form", "fields")
                : _.map(opts.fields, withNew(dwf.models.Field))
        );
    },

    slug: function () {
        return dwf.utils.slugify(this.get("name"));
    },

    ensureFieldPositions: function () {
        var i = 0;
        for ( ; i < this.choices.length; i++ ) {
            this.fields.at(i).position = i;
        }
        return this;
    },

    addField: function (field) {
        this.fields.add(field);
        return this;
    },

    removeField: function (field) {
        this.fields.remove(field);
        this.ensureFieldPositions();
        return this;
    },

    moveField: function (field, index) {
        field.set({ position: index });
        this.fields.sort();
        this.ensureFieldPositions();
        return this;
    }

});
