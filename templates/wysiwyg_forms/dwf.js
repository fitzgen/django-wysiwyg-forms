DWF = window.DWF || {};

(function () {
    var transactions = []
    DWF.getTransactions = function () {
        return transactions.slice(0); // slice to make a shallow copy
    };

    DWF.addTransaction = function (t) {
        transactions.push(t);
    };
}());

DWF.fieldTypes = [
    ["BooleanField", "CheckboxInput", "True or false checkbox"],
    ["CharField", "TextInput", "Short text"],
    ["CharField", "Textarea", "Large text"],
    ["ChoiceField", "Select", "Select single option"],
    ["DateField", "DateInput", "Date"],
    ["DateTimeField", "DateTimeInput", "Date and Time"],
    ["EmailField", "TextInput", "Email"],
    ["FileField", "FileInput", "File Upload"],
    ["FloatField", "TextInput", "Number (with or without decimal points)"],
    ["ImageField", "FileInput", "Image upload"],
    ["IntegerField", "TextInput", "Number (without decimal points)"],
    ["IPAddressField", "TextInput", "IP Address"],
    ["MultipleChoiceField", "SelectMultiple", "Select multiple options"],
    ["TimeField", "TextInput", "Time"],
    ["URLField", "TextInput", "URL hyperlink"]
];

DWF.fieldsList = $("#DWF-form-fields");

DWF.formName = {
    display : $("#DWF-form-name"),
    input   : $("#DWF-form-settings-name")
};
DWF.formDesc = {
    display : $("#DWF-form-description"),
    input   : $("#DWF-form-settings-description")
};

DWF.mirror = function (display, widget, callback) {
    widget.bind("keyup", function () {
        display.text(widget.val());
        callback && callback();
    });
};

DWF.register = (function () {
    var prev = {},
    views = {};

    // Call the appropriate setUp and tearDown views whenever the
    // window.location.hash changes.
    $(window).hashchange(function () {
        var hash = location.hash;
        prev.tearDown && prev.tearDown();

        if (views[hash]) {
            views[hash].setUp && views[hash].setUp();
            prev = views[hash];
        } else {
            views["__default__"].setUp();
            prev = {};
        }
    });

    // Run the __init__ view on document ready
    $(document).ready(function () {
        views["__init__"] && views["__init__"]();
    });

    // Returns a function that is used to register views to paths.
    return function (path, opts) {
        views[path] = opts;
    };
}());

DWF.register("#/add-field", {
    setUp: function () {
        $("#DWF-add-field").show();
    },
    tearDown: function () {
        $("#DWF-add-field").hide();
    }
});

DWF.register("#/field-settings", {
    setUp: function () {
        $("#DWF-field-settings").show();
    },
    tearDown: function () {
        $("#DWF-field-settings").hide();
    }
});

DWF.register("#/form-settings", (function () {
    var oldName, oldDesc;
    return {
        setUp: function () {
            $("#DWF-form-settings").show();

            DWF.formName.input.val(oldName = DWF.formName.display.text());
            DWF.formDesc.input.val(oldDesc = DWF.formDesc.display.text());

            DWF.mirror(DWF.formName.display, DWF.formName.input);
            DWF.mirror(DWF.formDesc.display, DWF.formDesc.input);
        },
        tearDown: function () {
            $("#DWF-form-settings").hide();

            DWF.formName.input.unbind("keyup");
            DWF.formDesc.input.unbind("keyup");

            // If the value of either has changed, create a transaction.
            if (oldName !== DWF.formName.display.text()) {
                DWF.addTransaction({
                    action : "change name",
                    to     : DWF.formName.display.text()
                });
            }
            if (oldDesc !== DWF.formDesc.display.text()) {
                DWF.addTransaction({
                    action : "change description",
                    to     : DWF.formDesc.display.text()
                });
            }
        }
    }
}()));

DWF.register("#/save", {
    setUp: function () {},
    tearDown: function () {}
})

// By default, go to the form settings view
DWF.register("__default__", {
    setUp: function () {
        location.hash = "#/form-settings";
    },
    tearDown: function () {}
});

DWF.register("__init__", function () {
    var initialForm = {{ form|safe }};
    DWF.formName.display.text(initialForm.name);
    DWF.formDesc.display.text(initialForm.description);
    DWF.formId = initialForm.id;

    for (var i = 0, len = initialForm.fields.length; i < len; i++)
        DWF.fieldsList.append( (function (f) {
            var attrs = { disabled: true },
            renderedWidget = DWF.widgets[f.widget] ?
                (new DWF.widgets[f.widget]()).render(f.name, attrs, f.choices) :
                (new DWF.widgets.TextInput()).render(f.name, attrs);
            return "<li><label>" + f.label + renderedWidget + "</label></li>";
        }(initialForm.fields[i])) );

    location.hash = "#/form-settings";
    $(window).hashchange();
});