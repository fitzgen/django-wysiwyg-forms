var DjangoWysiwygFormEditor = (function (exports) {

    /**
     * Utilities
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

    /**
     * Fields
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
                    { disabled: "disabled" },
                    self.choices
                )
            }, self));
        };

        self.type_ = type;
        self.widget = widget;
        self.name_ = "Some Field";
        self.label = "This is some form field.";
        self.choices = [];

        self.toJson = function () {
            return JSON.stringify(self);
        };

        return self;
    };

    /**
     * DjangoWysiwygFormEditor
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

        // Private methods and slots

        var fields = [];

        var formToHtml = function () {
            return $.tempest("wysiwyg-form", complete({
                fields: map(fields, function () {
                    return this.toHtml();
                }).join("\n")
            }, self));
        };

        var init = function () {
            var base = $(opts.target);
            base.append(formToHtml());

            base.find(".wysiwyg-form-controls").tabs();

            base.find("ul.wysiwyg-form-fields").sortable({
                placeholder: ".wysiwyg-form-field-placeholder"
            });

            // TODO: make this type of thing a higher order function.
            var formName = base.find("h1.wysiwyg-form-name");
            base.find("input.form-name").bind("keyup", function (event) {
                self.name = $(this).val();
                formName.text(self.name);
            });

            var formDescription = base.find("p.wysiwyg-form-description");
            base.find("input.form-description").bind("keyup", function (event) {
                self.description = $(this).val();
                formDescription.text(self.description);
            });
        };

        // Public methods and slots

        self.name = opts.name;
        self.description = opts.description;

        self.newField = function () {
            // TODO: Ability to create things other than text inputs.
            var f = new Field("CharField", "TextInput");
            fields.push(f);
            $(opts.target + " ul.wysiwyg-form-fields").append(f.toHtml());
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