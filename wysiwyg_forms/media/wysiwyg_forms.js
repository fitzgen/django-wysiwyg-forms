var DjangoWysiwygFormEditor = (function (exports) {

    /**
     * Utilities ***************************************************************
     */

    // Updates obj with only the things from other that are not already present
    // in obj.
    var complete = function (obj, other) {
        var thing;
        for (thing in other)
            if (other.hasOwnProperty(thing) && !obj.hasOwnProperty(thing))
                obj[thing] = other[thing];
        return obj;
    };

    var map = function (arr, fn) {
        var results, i;

        if (typeof Array.prototype.map === "function") {
            return Array.prototype.map.call(arr, fn);
        }
        else {
            results = [];
            for (i = 0; i < arr.length; i++)
                results.push(fn.call(arr[i], arr[i], i));
            return results;
        }
    };

    var slugify = function (str) {
        return str.
            replace(/^[\s\d_\-]+/, "").
            replace(/\s+$/, "").
            replace(/[\s\r\n\t]+/g, "-").
            replace(/[^\w\-]+/g, "").
            toLowerCase();
    };

    var isChoiceField = function (f) {
        var choiceFieldTypes = ["ChoiceField", "MultipleChoiceField"];
        for (var i = 0; i < choiceFieldTypes.length; i++)
            if (f.type_ === choiceFieldTypes[i])
                return true;
        return false;
    };

    /**
     * Fields ******************************************************************
     */

    var Field = function (type, widget) {
        if (!(this instanceof Field)) {
            return new Field();
        }
        var self = this;

        // Privates

        // Publics

        self.toHtml = function () {
            return $.tempest("wysiwyg-form-field", complete({
                widget: (new djangoWysiwygWidgets[self.widget]()).render(
                    name,
                    {},
                    self.choices
                )
            }, self));
        };

        self.type_ = type;
        self.widget = widget;
        self.label = "Some field";
        self.help_text = "This is a form field";
        self.required = true;
        self.choices = [];

        self.toJson = function () {
            return JSON.stringify(complete({
                name_: slugify(self.label)
            }, self));
        };

        return self;
    };

    /**
     * DjangoWysiwygFormEditor *************************************************
     */

    return function (opts) {
        if (!(this instanceof DjangoWysiwygFormEditor)) {
            return new (exports.DjangoWysiwygFormEditor(opts));
        }

        opts = complete(opts, {
            name: "Your Form",
            description: "This is your form."
        });

        if (opts.target === undefined)
            throw new TypeError("DjangoWysiwygFormEditor: No target for attachment specified");

        var self = this;

        // Private methods and slots -------------------------------------------

        var fields = [];
        var base = $(opts.target);

        var formToHtml = function () {
            return $.tempest("wysiwyg-form", complete({
                fields: map(fields, function () {
                    return this.toHtml();
                }).join("\n")
            }, self));
        };

        // Helper functions for opening tabs

        var openFormPropertiesTab = function () {
            return base.find("a[href=#form-props]").click();
        };
        var openFieldPropertiesTab = function () {
            return base.find("a[href=#field-props]").click();
        };
        var openDemoFieldsTab = function () {
            return base.find("a[href=#demo-fields]").click();
        };

        // Helpers for selecting/deselecting form fields

        var deselectAllFields = function () {
            base.find(".wysiwyg-form-field").removeClass("wysiwyg-selected");
        };
        var selectField = function (f) {
            f.addClass("wysiwyg-selected");
        };

        // Prepare the field properties tab for the given field.
        var setUpFieldPropertiesTab = function (field) {
            var tab = base.find("#field-props");
            tab.tempest("wysiwyg-field-properties", complete({
                is_choice_field: isChoiceField(field)
            }, field));
        };

        // Make a form field and a preview element have the same value, as well
        // as sync the attrName slot in obj with the value being edited.
        var mirror = function (preview, widget, obj, attrName) {
            preview = preview instanceof $ ?
                preview :
                base.find(preview);

            widget = widget instanceof $ ?
                widget :
                base.find(widget);

            widget.bind("keyup", function (event) {
                obj[attrName] = $(this).val();
                preview.text(obj[attrName]);
            });
        };

        // Initialize the WYSIWYG form editor.
        var init = function () {
            base.append(formToHtml());

            base.find(".wysiwyg-form-controls").tabs();

            base.find("ul.wysiwyg-form-fields").sortable({
                containment: "parent",
                placeholder: "wysiwyg-form-field-placeholder"
            });

            base.find(".wysiwyg-form").droppable({
                drop: function (event, ui) {
                    var droppedField = $(ui.draggable);

                    // Droppable will register all the field sortables, so make
                    // sure to only add a field to the form if the thing that
                    // was dropped is a demo field.
                    if (droppedField.hasClass("demo-field")) {
                        self.newField(droppedField.clone());
                    } else {
                        null;
                    }
                }
            });

            mirror("h1.wysiwyg-form-name", "input.form-name", self, "name");
            mirror("p.wysiwyg-form-description", "input.form-description", self, "description");

            // Map over the possible field types and create demo fields that can
            // be dragged on to the preview to add a field of that type.

            var demoFields = [
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
            var getFieldType = function (field) {
                return field[0];
            };
            var getFieldWidget = function (field) {
                return field[1];
            };
            var getFieldDescription = function (field) {
                return field[2];
            };

            map(demoFields, function(f) {
                var el = $("<li></li>");
                el.append("<h4>" + getFieldDescription(f) + "</h4>");
                el.append((new djangoWysiwygWidgets[getFieldWidget(f)]).render(
                    "unused",
                    {},
                    [["one", "Choice one"],
                     ["two", "Choice two"],
                     ["three", "Choice Three"]]
                ));
                el.addClass(getFieldType(f));
                el.addClass("demo-field");
                base.find("ul.demo-fields").append(el);
            });

            base.find(".demo-field").draggable({
                helper: "clone"
            });

        };

        // Public methods and slots --------------------------------------------

        self.name = opts.name;
        self.description = opts.description;

        self.newField = function (demoField) {
            // TODO: Ability to create things other than text inputs.
            var f = new Field("CharField", "TextInput");
            fields.push(f);

            // By attaching each double click handler one at a time, instead of
            // by grouped selector, we can take advantage of the current lexical
            // scope. This means we can reference this field directly in the
            // handler.

            var el = $(f.toHtml());
            el.dblclick(function (event) {
                deselectAllFields();
                selectField(el);

                openFieldPropertiesTab();
                setUpFieldPropertiesTab(f);

                mirror(el.find(".wysiwyg-form-field-label"),
                       "input.wysiwyg-field-label",
                       f,
                       "label");
                mirror(el.find(".wysiwyg-form-field-help-text"),
                       "input.wysiwyg-field-help-text",
                       f,
                       "help_text");
            });

            base.find("ul.wysiwyg-form-fields").append(el);
            return this;
        };

        self.save = function () {
            throw new Error("TODO");
        };

        self.toJson = function () {
            return JSON.stringify({
                name: self.name,
                description: self.description,
                fields: map(fields, function (f) {
                    return f.toJson();
                })
            });
        };

        init();

        return self;
    };

}());