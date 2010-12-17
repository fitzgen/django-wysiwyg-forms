/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global Backbone, _, dwf, undef */

// ### Controllers

dwf.controllers = dwf.controllers || {};

dwf.controllers.App = Backbone.Controller.extend({

    routes: {
        "/field-settings/"        : "fieldSettings",
        "/field-settings/:field/" : "fieldSettings",
        "/form-settings/"         : "formSettings",
        "/add-field/"             : "addField"
    },

    initialize: function (opts) {
    },

    fieldSettings: function (fieldSlug) {
        if ( ! fieldSlug ) {
            // TODO: Show message about selecting a field.
            return;
        }
    },

    formSettings: function () {
    },

    addField: function () {
    }

});