define(function (require, exports, module) {
    var handlers = {};

    exports.subscribe = function (path, func) {
        console.info("Subscribe: " + path, func);
        if ( ! (path in handlers) ) {
            handlers[path] = [];
        }

        handlers[path].push(func);
    };

    exports.unsubscribe = function (path, func) {
        console.info("Unsubscribe: " + path, func);
        if ( path in handlers ) {
            for ( var i = 0, len = handlers[path].length; i < len; i++ ) {
                if ( handlers[path][i] === func ) {
                    handlers[path].splice(i, 1);
                    return true;
                }
            }
        }
        return false;
    };

    exports.publish = function (path) {
        var data = [].slice.call(arguments, 1);
        console.info("Publish: " + path, data);
        for ( var i = 0, len = handlers[path].length; i < len; i++ ) {
            handlers[path][i].apply(null, data);
        }
    };
});
