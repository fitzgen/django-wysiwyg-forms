define(function (require, exports, module) {
    var View = exports.View = function () {};
    var util = require('dwf/util');

    View.prototype._template = '<div></div>';

    View.prototype.activate = function (rootElement, lib) {
        this.element = util.stringToDOM(this._template);
        this._elements = this.cacheElements(this._elements);
        rootElement.appendChild(this.element);
        this.lib = lib;
        this.addListeners(lib);
    };

    // Caches elements by selector after the template has been rendered so that
    // you can reference things easily without having to query the DOM
    // repeatedly. Just specify what you want saved as an object on
    // `SubClass.prototype._elements` of the form
    //
    //     { <name> : <selector> }
    //
    // and elements matching those selectors will automatically be cached in
    // `this._elements` for all your instances.
    View.prototype._elements = {};
    View.prototype.cacheElements = function (elements) {
        var cached = {};

        for ( var key in elements ) {
            if ( elements.hasOwnProperty(key) ) {
                cached[key] = $(this.element).find(elements[key]);
            }
        }

        return cached;
    };

    View.prototype.clearCachedElements = function () {
        for ( var k in this._elements ) {
            delete this._elements[k];
        }
        delete this._elements;
    };

    View.prototype.deactivate = function () {
        this.removeListeners();
        this.clearCachedElements();

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
