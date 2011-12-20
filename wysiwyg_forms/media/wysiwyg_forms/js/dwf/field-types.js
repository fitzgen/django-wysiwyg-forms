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
          description: "Select single option" },

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
          description: "Select multiple options" },

        { fieldType: "TimeField",
          widget: "TextInput",
          description: "Time" },

        { fieldType: "URLField",
          widget: "TextInput",
          description: "URL hyperlink" }
    ];

});
