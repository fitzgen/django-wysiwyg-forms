/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global dwf, Backbone */

// ### Views

dwf.views = dwf.views || {};

var missingArg = dwf.utils.missingArg;

function flattenAttrs (attrs) {
    var results = [], key;
    for (key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            results.push([key, '="', attrs[key], '"'].join(""));
        }
    }
    return results.join(" ");
}

function copy (obj) {
    var new_ = {}, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            new_[key] = obj[key];
        }
    }
    return new_;
}

// Parent prototype.
var Widget = Backbone.View.extend({
    tagName: "div",
    initialize: function (opts) {
        this.attrs = opts.attrs || {};
    },
    renderHTMLString: function (attrs) {
        throw new TypeError("Not implemented");
    },
    render: function () {
        if (this.name) {
            this.attrs.name = this.name;
        }
        this.el.innerHTML = this.renderHTMLString(this.attrs);
        return this;
    }
});

var Input = Widget.extend({
    inputType: null, // Override this in "subclasses".
    renderHTMLString: function (attrs) {
        return ["<input", flattenAttrs(attrs), "/>"].join(" ");
    },
    render: function () {
        this.attrs.type = this.inputType;
        return Widget.prototype.render.call(this);
    }
});

// Used by RadioSelect to render a single radio input.
var RadioInput = Input.extend({
    inputType: "radio"
});

dwf.views.TextInput = Input.extend({
    inputType: "text"
});

dwf.views.PasswordInput = Input.extend({
    inputType: "password"
});

dwf.views.FileInput = Input.extend({
    inputType: "file"
});

dwf.views.DateInput = Input.extend({
    initialize: function (opts) {
        Input.call(this, opts);
        this.attrs["class"] = this.attrs["class"] || "";
        this.attrs["class"] += " date-input";
    }
});

dwf.views.DateTimeInput = Input.extend({
    initialize: function (opts) {
        Input.call(this, opts);
        this.attrs["class"] = this.attrs["class"] || "";
        this.attrs["class"] += " date-time-input";
    }
});

dwf.views.TimeInput = Input.extend({
    initialize: function (opts) {
        Input.call(this, opts);
        this.attrs["class"] = this.attrs["class"] || "";
        this.attrs["class"] += " time-input";
    }
});

dwf.views.CheckboxInput = Input.extend({
    inputType: "checkbox"
});

dwf.views.Textarea = Widget.extend({
    renderHTMLString: function (attrs) {
        var value = attrs.value || "";
        delete attrs.value;
        return [
            "<textarea", flattenAttrs(attrs), ">",
            value,
            "</textarea>"
        ].join(" ");
    }
});

dwf.views.Select = Widget.extend({
    initialize: function (opts) {
        Widget.call(this, opts);
        this.choices = opts.choices || missingArg("dwf.veiws.Select", "choices");
    },
    renderHTMLString: function (attrs) {
        var i      = 0,
            output = [["<select ", flattenAttrs(attrs), ">"].join("")];

        for ( ; i < this.choices.length; i++ ) {
            output.push([
                '<option value="', this.choices.at(i).slug(), '">',
                this.choices.at(i).get("label"),
                "</option>"
            ].join(""));
        }

        output.push("</select>");
        return output.join("\n");
    }
});

dwf.views.SelectMultiple = dwf.views.Select.extend({
    renderHTMLString: function (attrs) {
        attrs.multiple = "multiple";
        return dwf.views.Select.renderHTMLString.call(this, attrs);
    }
});

var MultipleInputSelect = Widget.extend({
    _subInput: null, // Define in extensions.
    _name: null, // Define in extensions.
    initialize: function (opts) {
        this.choices = opts.choices || missingArg(this._name, "choices");
    },
    renderHTMLString: function (attrs) {
        var i,
        output = ["<ul>"];

        for (i = 0; i < this.choices.length; i++) {
            output.push(
                "<li>"
                    + (new this._subInput()).renderHTMLString({})
                    + this.choices.at(i).get("label")
                    + "</li>"
            );
        }

        output.push("</ul>");
        return output.join("\n");
    }
});

dwf.views.RadioSelect = MultipleInputSelect.extend({
    _subInput: RadioInput
});

dwf.views.CheckboxSelectMultiple = MultipleInputSelect.extend({
    _subInput: dwf.views.CheckboxInput
});
