define(function (require, exports, module) {
    var View = require('dwf/views/base-view').View;
    var util = require('dwf/util');

    var Messages = exports.Messages = function () {};
    Messages.prototype = new View();
    Messages.prototype._template = require('text!dwf/views/messages.html');
    Messages.prototype._messageCounter = 0;
    Messages.prototype.DEFAULT_MESSAGE_TIME = 20000;
    Messages.prototype.MESSAGE_FADE_TIME = 1000;

    Messages.prototype._attachMessage = function (msg, cls, id, time) {
        msg = $('<li class="' + cls + '" id="DWF-message-' + id + '">' + msg + '</li>');
        msg.click(util.bind(function () {
            this.removeMessage(id);
        }, this));
        msg.hide();
        msg.appendTo(this.element);
        msg.fadeIn(this.MESSAGE_FADE_TIME);

        setTimeout(util.bind(function () {
            this.removeMessage(id);
        }, this), time || this.DEFAULT_MESSAGE_TIME);
    };

    Messages.prototype.success = function (msg, time) {
        var id = this._messageCounter++;
        this._attachMessage(msg, 'DWF-message-success', id, time);
        return id;
    };

    Messages.prototype.info = function (msg, time) {
        var id = this._messageCounter++;
        this._attachMessage(msg, 'DWF-message-info', id, time);
        return id;
    };

    Messages.prototype.warn = function (msg, time) {
        var id = this._messageCounter++;
        this._attachMessage(msg, 'DWF-message-warn', id, time);
        return id;
    };

    Messages.prototype.removeMessage = function (id) {
        $(this.element).find('#DWF-message-' + id).fadeOut(this.MESSAGE_FADE_TIME);
    };
});
