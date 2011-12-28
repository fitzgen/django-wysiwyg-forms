define(function (require, exports, module) {

    exports.FIELD_TYPES = [
        { fieldType: "BooleanField",
          widget: "CheckboxInput",
          description: "True or false checkbox" },

        { fieldType: "CharField",
          widget: "TextInput",
          description: "Short text" },

        { fieldType: "CharField",
          widget: "Textarea",
          description: "Large text" },

        { fieldType: "ChoiceField",
          widget: "Select",
          description: "Select single option",
          hasChoices: true },

        { fieldType: "DateField",
          widget: "DateInput",
          description: "Date" },

        { fieldType: "DateTimeField",
          widget: "DateTimeInput",
          description: "Date and Time" },

        { fieldType: "EmailField",
          widget: "TextInput",
          description: "Email" },

        { fieldType: "FileField",
          widget: "FileInput",
          description: "File Upload" },

        { fieldType: "FloatField",
          widget: "TextInput",
          description: "Number (with or without decimal points)" },

        { fieldType: "ImageField",
          widget: "FileInput",
          description: "Image upload" },

        { fieldType: "IntegerField",
          widget: "TextInput",
          description: "Number (without decimal points)" },

        { fieldType: "IPAddressField",
          widget: "TextInput",
          description: "IP Address" },

        { fieldType: "MultipleChoiceField",
          widget: "CheckboxSelectMultiple",
          description: "Select multiple options",
          hasChoices: true },

        { fieldType: "TimeField",
          widget: "TextInput",
          description: "Time" },

        { fieldType: "URLField",
          widget: "TextInput",
          description: "URL hyperlink" }
    ];

    // Iterate over each of the field types, return false to break out of the
    // iteration.
    exports.eachFieldType = function (fn, ctx) {
        var ret = true;
        var i = 0;
        var len = exports.FIELD_TYPES.length
        ctx = ctx || {};
        for ( ; i < len && ret !== false; i++ ) {
            ret = fn.call(ctx, exports.FIELD_TYPES[i]);
        }
    };

    // Returns true if the given field type has choices.
    exports.hasChoices = function (type) {
        var ret = false;
        exports.eachFieldType(function (t) {
            if ( t.fieldType === type && t.hasChoices ) {
                ret = true;
                return false;
            }
        });
        return ret;
    };

});
