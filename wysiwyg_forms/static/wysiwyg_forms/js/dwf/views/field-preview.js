define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var widgets = require('dwf/widgets');
    var util = require('dwf/util');

    var FieldPreview = exports.FieldPreview = function () {};
    FieldPreview.prototype = new View();
    FieldPreview.prototype._template = require('text!dwf/views/field-preview.html');

    FieldPreview.prototype._elements = {
        required: '.DWF-field-required',
        label: '.DWF-field-label',
        helpText: '.DWF-help-text',
        widget: '.DWF-field-widget'
    };

    FieldPreview.prototype.addListeners = function (lib) {
        $(this.element).click(util.bind(function () {
            lib.activateField(this._elements.label.text());
            this.activateField();
        }, this));

        $(this.element).find('.DWF-delete').click(util.bind(function (e) {
            if ( this.isActiveField() ) {
                lib.deleteActiveField(this._elements.label.text());
            } else {
                lib.deleteField(this._elements.label.text());
            }
            this.deactivate();
            e.stopPropagation();
            e.preventDefault();
        }, this));
    };

    FieldPreview.prototype.displayRequired = function (val) {
        if ( val ) {
            this._elements.required.show();
        } else {
            this._elements.required.hide();
        }
    };

    FieldPreview.prototype.displayLabel = function (val) {
        this._elements.label.text(val);
    };

    FieldPreview.prototype.displayHelpText = function (val) {
        this._elements.helpText.text(val);
    };

    FieldPreview.prototype.displayWidget = function (widget, choices) {
        this._elements.widget.contents().remove();

        var attrs = {};
        var renderedWidget = widgets[widget] ?
            (new widgets[widget]()).render(null, attrs, choices) :
            (new widgets.TextInput()).render(null, attrs);

        this._elements.widget.append(renderedWidget);
    };

    // Not to be confused with all Views' `activate` and `deactivate`
    // methods. These methods declare whether or not this field is the form
    // field which is active or for editing.

    FieldPreview.prototype.activateField = function () {
        $(this.element).addClass('DWF-active-field');
    };

    FieldPreview.prototype.isActiveField = function () {
        return $(this.element).hasClass('DWF-active-field');
    };

    FieldPreview.prototype.deactivateField = function () {
        $(this.element).removeClass('DWF-active-field');
    };
});
