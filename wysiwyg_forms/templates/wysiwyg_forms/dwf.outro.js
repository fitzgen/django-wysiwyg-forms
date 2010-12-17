/*jslint browser: true, onevar: true, undef: true, eqeqeq: true, bitwise: true,
  newcap: true, immed: true, nomen: false, white: false, plusplus: false,
  laxbreak: true */

/*global $, Backbone, _, dwf, undef */

// ### Outro

dwf.form = new dwf.models.Form($.parseJSON($("#form-json").html()));

dwf.transactionManager = new dwf.transactions.TransactionManager({
    form: dwf.form
});

dwf.controlPanel = new dwf.views.ControlPanel({
    form: dwf.form,
    el: $("#control-panel")
});
dwf.controlPanel.render();

dwf.preview = new dwf.views.Preview({
    form: dwf.form,
    el: $("#preview")
});
dwf.preview.render();

// dwf.app = new dwf.controllers.App({
//     controlPanel: dwf.controlPanel
// });
// Backbone.history.start();