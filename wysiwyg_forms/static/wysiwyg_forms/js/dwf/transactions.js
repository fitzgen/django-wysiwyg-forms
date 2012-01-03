define(function (require, exports, module) {
    require('jquery.django-csrf');

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
        var transactionsToSave = transactions;
        transactions = [];
        if ( transactionsToSave.length > 0 ) {
            preSaveHook && preSaveHook();

            var promise = $.post(target, {
                transactions: JSON.stringify(transactionsToSave)
            });

            promise.success(function () {
                postSaveHook && postSaveHook();
                timerId = setTimeout(loop, TIMER_LENGTH);
            });

            promise.error(function (xhr) {
                try {
                    errorSaveHook && errorSaveHook(JSON.parse(xhr.responseText).error);
                }
                catch (e) {
                    errorSaveHook && errorSaveHook();
                }
                transactions = transactionsToSave.concat(transactions);
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
