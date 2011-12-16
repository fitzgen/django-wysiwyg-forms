define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var widgets = require('dwf/widgets');

    var FIELD_TYPES = [
        ["BooleanField",        "CheckboxInput",  "True or false checkbox"],
        ["CharField",           "TextInput",      "Short text"],
        ["CharField",           "Textarea",       "Large text"],
        ["ChoiceField",         "Select",         "Select single option"],
        ["DateField",           "DateInput",      "Date"],
        ["DateTimeField",       "DateTimeInput",  "Date and Time"],
        ["EmailField",          "TextInput",      "Email"],
        ["FileField",           "FileInput",      "File Upload"],
        ["FloatField",          "TextInput",      "Number (with or without decimal points)"],
        ["ImageField",          "FileInput",      "Image upload"],
        ["IntegerField",        "TextInput",      "Number (without decimal points)"],
        ["IPAddressField",      "TextInput",      "IP Address"],
        ["MultipleChoiceField", "SelectMultiple", "Select multiple options"],
        ["TimeField",           "TextInput",      "Time"],
        ["URLField",            "TextInput",      "URL hyperlink"]
    ];

    var AddFieldTab = exports.AddFieldTab = function () {};
    AddFieldTab.prototype = new View();
    AddFieldTab.prototype._template = require('text!dwf/views/add-field-tab.html');

    AddFieldTab.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        // Create all of the initial demo fields.
        var ul = $('ul', this.element);
        for (var i = 0, len = FIELD_TYPES.length; i < len; i++) {
            ul.append( (function (field, widget, description) {
                var renderedWidget = (new widgets[widget]()).render("",
                                                                    {},
                                                                    [["one", "Choice One"],
                                                                     ["two", "Choice Two"],
                                                                     ["three", "Choice Three"]]);
                var hiddenData = "<input type='hidden' value='" + field + "--" + widget + "' />";
                return "<li>"
                    + hiddenData + "<button>Add</button>"
                    + "<p>" + description + "</p>" + renderedWidget + "</li>";
            }(FIELD_TYPES[i][0], FIELD_TYPES[i][1], FIELD_TYPES[i][2])) );
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
