/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global dwf */

// ### Utils

dwf.utils = dwf.utils || {};

dwf.utils.MissingArgumentError = function (msg) {
    this.message = msg;
};
dwf.utils.MissingArgumentError.prototype = new TypeError();
dwf.utils.MissingArgumentError.prototype.name = "MissingArgumentError";

dwf.utils.missingArg = function (who, arg) {
    throw new dwf.utils.MissingArgumentError(who
                                             + " expected argument '"
                                             + arg
                                             + "' but it is missing.");
};

dwf.utils.slugify = function (str) {
    str = $.trim(str.replace(/[^\w\s\-]/, "")).toLowerCase();
    return str.replace(/[\-\s]+/, "_").slice(0, 50);
};

dwf.utils.withNew = function (Ctor) {
    return function (opts) {
        return new Ctor(opts);
    };
};
