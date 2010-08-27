DWF = window.DWF || {};

// ### Transactions

(function () {
    var transactions = []
    DWF.getTransactions = function () {
        return transactions.slice(0); // slice to make a shallow copy
    };

    DWF.addTransaction = function (t) {
        transactions.push(t);
    };
}());

// TODO: Do I ever need this list after the first demo fields are rendered? Does
// that mean it can be removed?
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

// ### References to Common Elements

DWF.fieldsList = $("#DWF-form-fields");
DWF.demoFieldsList = $("#DWF-add-field ul");

DWF.formName = {
    display : $("#DWF-form-name"),
    input   : $("#DWF-form-settings-name")
};
DWF.formDesc = {
    display : $("#DWF-form-description"),
    input   : $("#DWF-form-settings-description")
};

// ### Helper Functions

DWF.fieldWithLabelExists = function (label) {
    var labels = DWF.fieldsList.find("li strong"), i = 0, len = labels.length;
    for ( ; i < len; i++) if (labels[i].innerHTML === label) return true;
    return false;
};

DWF.mirror = function (display, widget, callback) {
    widget.bind("keyup", function () {
        display.text(widget.val());
        callback && callback();
    });
};

DWF.prompt = function (msg, callback) {
    // TODO: make a modal window in HTML.
    var res = prompt(msg);
    res = res ? res : false;
    setTimeout(function () {
        callback(res)
    }, 20);
};

DWF.paragraphify = function (text) {
    return (text = text.replace(/^\s+/, "").replace(/\s+$/, "")) ?
        "<p>" + text.replace(/[\n\r]+/, "</p><p>") + "</p>" :
        "";
};

DWF.renderFieldToForm = function (f) {
    var attrs = { disabled: true },
    renderedWidget = DWF.widgets[f.widget] ?
        (new DWF.widgets[f.widget]()).render(f.name, attrs, f.choices) :
        (new DWF.widgets.TextInput()).render(f.name, attrs);
    return DWF.fieldsList.append("<li class='DWF-field'><label><strong>" + f.label + "</strong>"
                                 + DWF.paragraphify(f.help_text) + renderedWidget
                                 + "</label></li>");
};


// ### Implementation of Views

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

// ### Views

DWF.register("#/add-field", {
    setUp: function () {
        $("#DWF-add-field").show();
        DWF.demoFieldsList.delegate("button", "click", function () {
            var hiddenData = $(this).closest("li").find("input[type=hidden]").val().split("--"),
            fieldType = hiddenData[0],
            widget = hiddenData[1];

            DWF.prompt("Label:", function (label) {
                if (label) {
                    if (DWF.fieldWithLabelExists(label)) {
                        DWF.prompt("A field with that label already exists. Enter a new one:",
                                   arguments.callee);
                    } else {
                        DWF.addTransaction({
                            action : "add field",
                            label  : label
                        });
                        DWF.addTransaction({
                            action : "change field type",
                            label  : label,
                            to     : fieldType
                        });
                        DWF.addTransaction({
                            action : "change field widget",
                            label  : label,
                            to     : widget
                        });
                        DWF.renderFieldToForm({ label     : label,
                                                widget    : widget,
                                                help_text : "",
                                                choices   : [] });
                    }
                }
            });
        });
    },
    tearDown: function () {
        $("#DWF-add-field").hide();
        DWF.demoFieldsList.undelegate();
    }
});

DWF.register("#/field-settings", (function () {
    var fieldSettings = $("#DWF-field-settings"),
    fieldExists = function (f) {
        return DWF.fieldsList.find(".DWF-field").index(f) >= 0;
    };
    return {
        setUp: function () {
            console.log("in setup");
            fieldSettings.show();
            if (DWF.activeField && fieldExists(DWF.activeField)) {
                console.log("field exists");
                // do stuff
            } else {
                console.log("doesn't exist");
                if (DWF.fieldsList.find(".DWF-field").length === 0) {
                    console.log("no fields");
                    fieldSettings.find("#DWF-no-fields-msg").show();
                } else {
                    console.log("none selected");
                    fieldSettings.find("#DWF-none-selected-msg").show();
                }
            }
        },
        tearDown: function () {
            fieldSettings.hide();
            fieldSettings.find("#DWF-no-fields-msg").hide();
            fieldSettings.find("#DWF-none-selected-msg").hide();
        }
    }
}()));

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
    setUp: function () {
        var base = $("#DWF-base"),
        numDots = 0;
        base.html("<h1 style='text-align:center'>Saving</h1>");
        setInterval(function () {
            return numDots > 2 ?
                base.text("Saving") :
                base.text(base.text() + ".") && numDots++;
        }, 250);
        $.post("{% url wysiwyg_forms_apply_transactions %}",
               { form_id: DWF.formId,
                 transactions: JSON.stringify(DWF.getTransactions()) },
               function () {
                   location.reload();
               });
    },
    tearDown: function () {
    }
});

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

    // Render all of the existing form fields.
    for (var i = 0, len = initialForm.fields.length; i < len; i++)
        DWF.renderFieldToForm(initialForm.fields[i]);

    // Create all of the initial demo fields.
    for (i = 0, len = DWF.fieldTypes.length; i < len; i++) {
        DWF.demoFieldsList.append( (function (field, widget, description) {
            var renderedWidget = (new DWF.widgets[widget]()).render("",
                                                                    {},
                                                                    [["one", "One"],
                                                                     ["two", "Two"],
                                                                     ["three", "Three"]]);
            var hiddenData = "<input type='hidden' value='" + field + "--" + widget + "' />";
            return "<li>" + hiddenData + "<button>Add</button>" + "<p>" + description + "</p>" + renderedWidget + "</li>";
        }(DWF.fieldTypes[i][0], DWF.fieldTypes[i][1], DWF.fieldTypes[i][2])) );
    }

    // Manage the hover/selection of fields.
    DWF.fieldsList.delegate(".DWF-field", "mouseenter", function () {
        !($(this).hasClass("DWF-active-field")) && $(this).addClass("DWF-hover-field");
    });
    DWF.fieldsList.delegate(".DWF-field", "mouseleave", function () {
        $(this).removeClass("DWF-hover-field");
    });

    DWF.fieldsList.delegate(".DWF-field", "click", function () {
        DWF.fieldsList.find(".DWF-field").removeClass("DWF-active-field");
        DWF.activeField = $(this);
        $(this).addClass("DWF-active-field");
        location.hash = "#/field-settings";
        $(window).hashchange();
    });

    location.hash = "#/form-settings";
    $(window).hashchange();
});