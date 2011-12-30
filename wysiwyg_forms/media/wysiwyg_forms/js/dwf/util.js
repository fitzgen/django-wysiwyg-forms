define(function (require, exports, module) {
    exports.prompt = function (msg, callback) {
        var res = prompt(msg);
        res = res ? res : false;
        setTimeout(function () {
            callback(res)
        }, 20);
    };

    exports.getSetter = function (attr, onChangeCallback) {
        return function (val) {
            switch ( arguments.length ) {
            case 0:
                return this[attr];
            case 1:
                var old = this[attr];
                this[attr] = val;
                onChangeCallback.call(this, val, old);
                break;
            default:
                throw new TypeError(
                    'Expected zero or one argument, received more than one.'
                );
            }
        };
    }

    // Only use this with absolutely safe strings! Otherwise, XSS!
    exports.stringToDOM = function (str) {
        var div = document.createElement('div');
        div.innerHTML = str;
        return div.firstChild;
    };

    exports.bind = function (fn, ctx) {
        return function () {
            return fn.apply(ctx, arguments);
        };
    };
});
