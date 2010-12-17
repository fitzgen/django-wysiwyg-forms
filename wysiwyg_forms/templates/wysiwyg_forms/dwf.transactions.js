/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global Backbone, _, dwf, undef */

dwf.transactions = dwf.transactions || {};

var missingArg = dwf.utils.missingArg;

dwf.transactions.TransactionManager = function (opts) {
    this.initialize(opts);
};

dwf.transactions.TransactionManager.prototype = {

    initialize: function (opts) {
        var form = opts.form || missingArg("dwf.transactions.TransactionListener", "form"),
             transactions = [];
        this.getTransactions = function () {
            return transactions.slice();
        };
        this.listenForTransactions(form, function (action, txn) {
            txn.action = action;
            transactions.push(txn);
        });
    },

    listenForTransactions: function (form, addTransaction) {

        function listen (action, fn) {
            form.bind("transaction:" + action.replace(/\s+/g, "-"), function () {
                addTransaction(action, fn.apply(this, arguments));
            });
        }

        listen("change name", function (name) {
            return {
                to: name
            };
        });

        listen("change description", function (desc) {
            return {
                to: desc
            };
        });

    }

};
