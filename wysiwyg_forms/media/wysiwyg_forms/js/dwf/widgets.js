define(function (require, exports, module) {
    var flattenAttrs = function (attrs) {
        var results = [], key;
        for (key in attrs) if (attrs.hasOwnProperty(key))
            results.push([key, '="', attrs[key], '"'].join(""));
        return results.join(" ");
    };

    var choiceVal = function (choice) {
        return choice[0];
    };

    var choiceLabel = function (choice) {
        return choice[1];
    };

    var Input = function () {};
    Input.prototype.inputType = null; // subclasses will override this.
    Input.prototype.render = function (name, attrs) {
        if ( name ) {
            attrs.name = name;
        }
        return ["<input",
                flattenAttrs(attrs),
                "type=\"" + this.inputType + "\" />"].join(" ");
    };

    // Used by RadioSelect to render a single <input type="radio">
    var RadioInput = function () {};
    RadioInput.prototype = new Input();
    RadioInput.prototype.inputType = "radio";

    // Public form widgets.

    exports.TextInput = function () {};
    exports.TextInput.prototype = new Input();
    exports.TextInput.prototype.inputType = "text";

    exports.PasswordInput = function () {};
    exports.PasswordInput.prototype = new Input();
    exports.PasswordInput.prototype.inputType = "password";

    exports.FileInput = function () {};
    exports.FileInput.prototype = new Input();
    exports.FileInput.prototype.inputType = "file";

    exports.DateInput = function () {};
    exports.DateInput.prototype = new exports.TextInput();

    exports.DateTimeInput = function () {};
    exports.DateTimeInput.prototype = new exports.TextInput();

    exports.TimeInput = function () {};
    exports.TimeInput.prototype = new exports.TextInput();

    exports.CheckboxInput = function () {};
    exports.CheckboxInput.prototype = new Input();
    exports.CheckboxInput.prototype.inputType = "checkbox";

    exports.Textarea = function () {};
    exports.Textarea.prototype.render = function (name, attrs) {
        if ( name ) {
            attrs.name = name;
        }
        return ["<textarea", flattenAttrs(attrs), "></textarea>"].join(" ");
    };

    exports.Select = function () {};
    exports.Select.prototype.render = function (name, attrs, choices) {
        if ( name ) {
            attrs.name = name;
        }

        var i,
            output = [["<select ", flattenAttrs(attrs), ">"].join("")];

        for (i = 0; i < choices.length; i++) {
            output.push(['<option value="',
                         choiceVal(choices[i]),
                         '">',
                         choiceLabel(choices[i]),
                         "</option>"].join(""));
        }

        output.push("</select>");
        return output.join("\n");
    };

    exports.SelectMultiple = function () {};
    exports.SelectMultiple.prototype = new exports.Select();
    exports.SelectMultiple.prototype.render = function (name, attrs, choices) {
        if ( name ) {
            attrs.name = name;
        }
        attrs.multiple = "multiple";
        return exports.Select.prototype.render(name, attrs, choices);
    };

    exports.RadioSelect = function () {};
    exports.RadioSelect.prototype.render = function (name, attrs, choices) {
        if ( name ) {
            attrs.name = name;
        }

        var i,
            output = ["<ul>"];

        for (i = 0; i < choices.length; i++) {
            output.push("<li>" +
                        (new RadioInput()).render(name, attrs) +
                        choiceLabel(choices[i]) +
                        "</li>");
        }

        output.push("</ul>");
        return output.join("\n");
    };

    exports.CheckboxSelectMultiple = function () {};
    exports.CheckboxSelectMultiple.prototype.render = function (name, attrs, choices) {
        if ( name ) {
            attrs.name = name;
        }

        var i,
            output = ["<ul>"];

        for (i = 0; i < choices.length; i++) {
            output.push("<li>" +
                        (new exports.CheckboxInput()).render(name, attrs) +
                        choiceLabel(choices[i]) +
                        "</li>");
        }

        output.push("</ul>");
        return output.join("\n");
    };
});
