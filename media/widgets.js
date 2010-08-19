var djangoWysiwygWidgets = {};

(function (w) {

    var flattenAttrs = function (attrs) {
        var results = [], key;
        for (key in attrs)
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
        attrs.name = name;
        return ["<input",
                flattenAttrs(attrs),
                "type=\"" + this.inputType + "\" />"].join(" ");
    };

    // Used by RadioSelect to render a single <input type="radio">
    var RadioInput = function () {};
    RadioInput.prototype = new Input();
    RadioInput.prototype.inputType = "radio";

    // Public form widgets.

    w.TextInput = function () {};
    w.TextInput.prototype = new Input();
    w.TextInput.prototype.inputType = "text";

    w.PasswordInput = function () {};
    w.PasswordInput.prototype = new Input();
    w.PasswordInput.prototype.inputType = "password";

    // Don't need hidden inputs for a WYSIWYG form builder...
    // w.HiddenInput = function () {};
    // w.HiddenInput.prototype = new Input();
    // w.HiddenInput.prototype.inputType = "hidden";

    w.FileInput = function () {};
    w.FileInput.prototype = new Input();
    w.FileInput.prototype.inputType = "file";

    w.DateInput = function () {};
    w.DateInput.prototype = new w.TextInput();

    w.DateTimeInput = function () {};
    w.DateTimeInput.prototype = new w.TextInput();

    w.TimeInput = function () {};
    w.TimeInput.prototype = new w.TextInput();

    w.CheckboxInput = function () {};
    w.CheckboxInput.prototype = new Input();
    w.CheckboxInput.prototype.inputType = "checkbox";

    w.Textarea = function () {};
    w.Textarea.prototype.render = function (name, attrs) {
        attrs.name = name;
        return ["<textarea", flattenAttrs(attrs), "></textarea>"].join(" ");
    };

    w.Select = function () {};
    w.Select.prototype.render = function (name, attrs, choices) {
        attrs.name = name;
        
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

    w.SelectMultiple = function () {};
    w.SelectMultiple.prototype = new w.Select();
    w.SelectMultiple.prototype.render = function (name, attrs, choices) {
        attrs.name = name;
        attrs.multiple = "multiple";
        return w.Select.prototype.render(name, attrs, choices);
    };

    w.RadioSelect = function () {};
    w.RadioSelect.prototype.render = function (name, attrs, choices) {
        attrs.name = name;
        
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

    w.CheckboxSelectMultiple = function () {};
    w.CheckboxSelectMultiple.prototype.render = function (name, attrs, choices) {
        attrs.name = name;
        
        var i,
            ouput = ["<ul>"];
                        
        for (i = 0; i < choices.length; i++) {
            output.push("<li>" +
                        (new CheckboxInput()).render(name, attrs) +
                        choiceLabel(choices[i]) +
                        "</li>");
        }
        
        output.push("</ul>");
        return output.join("\n");                
    };
     
}(djangoWysiwygWidgets));