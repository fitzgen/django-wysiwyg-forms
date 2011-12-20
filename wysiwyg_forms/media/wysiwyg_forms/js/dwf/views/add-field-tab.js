define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var widgets = require('dwf/widgets');
    var FIELD_TYPES = require('dwf/field-types').FIELD_TYPES;

    var AddFieldTab = exports.AddFieldTab = function () {};
    AddFieldTab.prototype = new View();
    AddFieldTab.prototype._template = require('text!dwf/views/add-field-tab.html');

    AddFieldTab.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        // Create all of the initial demo fields.
        var ul = $('ul', this.element);
        for (var i = 0, len = FIELD_TYPES.length; i < len; i++) {
            var renderedWidget = (new widgets[FIELD_TYPES[i].widget]())
                .render("",
                        {},
                        [["one", "Choice One"],
                         ["two", "Choice Two"],
                         ["three", "Choice Three"]]);
            var hiddenData = "<input type='hidden' value='"
                + FIELD_TYPES[i].fieldType + "--" + FIELD_TYPES[i].widget + "' />";
            ul.append("<li>"
                      + hiddenData + "<button>Add</button>"
                      + "<p>" + FIELD_TYPES[i].description + "</p>"
                      + renderedWidget + "</li>");
        }
    };

    AddFieldTab.prototype.addListeners = function (lib) {
        $(this.element).delegate("button", "click", function () {
            var hiddenData = $(this).closest("li").find("input[type=hidden]").val().split("--"),
                fieldType = hiddenData[0],
                widget = hiddenData[1];
            lib.addField(fieldType, widget);
        });
    };
});
