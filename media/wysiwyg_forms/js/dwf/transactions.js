define(function (require, exports, module) {
    var transactions = [];
    var timerId;
    var preSaveHook;
    var postSaveHook;
    var errorSaveHook;
    var target;
    var formId;
    var TIMER_LENGTH = 30000;

    exports.addTransaction = function (t) {
        transactions.push(t);
    };

    function loop () {
        var transactionsToSave = transactions.splice(0, transactions.length);
        if ( transactionsToSave.length > 0 ) {
            preSaveHook && preSaveHook();

            var promise = $.post(target, {
                form_id: formId,
                transactions: JSON.stringify(transactionsToSave)
            });

            promise.success(function () {
                postSaveHook && postSaveHook();
                timerId = setTimeout(loop, TIMER_LENGTH);
            });

            promise.error(function () {
                errorSaveHook && errorSaveHook();
                transactions.splice(0, 0, transactionsToSave);
                timerId = setTimeout(loop, TIMER_LENGTH);
            });
        }
        else {
            timerId = setTimeout(loop, TIMER_LENGTH);
        }
    }

    exports.startAutoSaveLoop = function (hooks) {
        preSaveHook = hooks.preSave;
        postSaveHook = hooks.postSave;
        errorSaveHook = hooks.error;
        target = hooks.target;
        formId = hooks.formId;
        timerId = setTimeout(loop, TIMER_LENGTH)
    };

    exports.saveNow = function () {
        clearTimeout(timerId);
        loop();
    };
});
