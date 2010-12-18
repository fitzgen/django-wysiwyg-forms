/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global _, window, $, dwf, Backbone */

// ### Views

dwf.views = dwf.views || {};

var missingArg = dwf.utils.missingArg;

dwf.views.ControlPanel = Backbone.View.extend({

    events: {
        // TODO: Bind to "change" events instead, which is going to require
        // binding by hand rather than using Backbone's built in delegation.
        "keyup #form-name-input": "saveName",
        "keyup #form-description-input": "saveDescription"
    },

    initialize: function (opts) {
        this.form = opts.form || missingArg("dwf.veiws.ControlPanel", "form");
        this.nameInput = this.$("#form-name-input");
        this.descriptionInput = this.$("#form-description-input");
    },

    render: function () {
        this.el.tabs({
            select: function (event, ui) {
                window.location.hash = ui.tab.href.replace(/\S*#/, "#/");
            }
        });
        this.nameInput.val(this.form.get("name"));
        this.descriptionInput.val(this.form.get("description"));
        return this;
    },

    saveName: function (event) {
        var name = this.nameInput.val();
        this.form.set({
            name: name
        });
        this.form.trigger("transaction:change-name", name);
    },

    saveDescription: function () {
        var desc = this.descriptionInput.val();
        this.form.set({
            description: desc
        });
        this.form.trigger("transaction:change-description", desc);
    }

});

dwf.views.Preview = Backbone.View.extend({

    initialize: function (opts) {
        this.form = opts.form || missingArg("dwf.views.Preview", "form");
        this.nameElement = this.$("#form-name");
        this.descElement = this.$("#form-description");

        this.form.bind("change:name", _.bind(function (form, name) {
            this.nameElement.text(name);
        }, this));

        this.form.bind("change:description", _.bind(function (form, desc) {
            this.descElement.text(desc);
        }, this));
    },

    render: function () {
        this.nameElement.text(this.form.get("name"));
        this.descElement.text(this.form.get("description"));
        return this;
    }

});
