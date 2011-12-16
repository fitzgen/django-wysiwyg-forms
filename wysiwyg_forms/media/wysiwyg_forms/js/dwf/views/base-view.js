define(function (require, exports, module) {
    var View = exports.View = function () {};
    var util = require('dwf/util');

    View.prototype._template = '<div></div>';

    View.prototype.activate = function (rootElement, lib) {
        this.element = util.stringToDOM(this._template);
        rootElement.appendChild(this.element);
        this.lib = lib;
        this.addListeners(lib);
    };

    View.prototype.deactivate = function () {
        this.removeListeners();

        while ( this.element.firstChild ) {
            this.element.removeChild(this.element.firstChild);
        }

        this.element.parentElement.removeChild(this.element);
    };

    View.prototype.addListeners = function (lib) {
        // Implement this yourself.
    };

    View.prototype.removeListeners = function () {
        // Implement this yourself.
    };

    View.prototype.show = function () {
        this.element.style.display = 'block';
    };

    View.prototype.hide = function () {
        this.element.style.display = 'none';
    };
});
