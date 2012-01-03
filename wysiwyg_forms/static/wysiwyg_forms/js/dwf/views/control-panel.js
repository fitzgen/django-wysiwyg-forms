define(function (require, exports, module) {
    var AddFieldTab = require('dwf/views/add-field-tab').AddFieldTab;
    var FieldSettingsTab = require('dwf/views/field-settings-tab').FieldSettingsTab;
    var FormSettingsTab = require('dwf/views/form-settings-tab').FormSettingsTab;
    var View = require('dwf/views/base-view').View;
    var util = require('dwf/util');

    var ControlPanel = exports.ControlPanel = function () {};
    ControlPanel.prototype = new View();
    ControlPanel.prototype._template = require('text!dwf/views/control-panel.html');

    ControlPanel.prototype.activate = function (rootElement, lib) {
        View.prototype.activate.call(this, rootElement, lib);

        this._addFieldTab = new AddFieldTab();
        this._fieldSettingsTab = new FieldSettingsTab();
        this._formSettingsTab = new FormSettingsTab();

        this._addFieldTab.activate(this.element, lib);
        this._fieldSettingsTab.activate(this.element, $.extend({
            openAddFieldTab: util.bind(this.openAddFieldTab, this)
        }, lib));
        this._formSettingsTab.activate(this.element, lib);

        this.openFormSettingsTab();
    };

    ControlPanel.prototype.addListeners = function (lib) {
        $('.add-field', this.element).click(util.bind(this.openAddFieldTab, this));
        $('.field-settings', this.element).click(util.bind(this.openFieldSettingsTab, this));
        $('.form-settings', this.element).click(util.bind(this.openFormSettingsTab, this));
    };

    ControlPanel.prototype._hideTabs = function () {
        this._addFieldTab.hide();
        $(this.element).find('.add-field').removeClass('DWF-active-tab');
        this._fieldSettingsTab.hide();
        $(this.element).find('.field-settings').removeClass('DWF-active-tab');
        this._formSettingsTab.hide();
        $(this.element).find('.form-settings').removeClass('DWF-active-tab');
    };

    ControlPanel.prototype.deactivate = function () {
        this.addFieldTab.deactivate();
        this.fieldSettingsTab.deactivate();
        this.formSettingsTab.deactivate();

        View.prototype.deactivate.call(this);
    };

    ControlPanel.prototype.openFieldSettingsTab = function () {
        this._hideTabs();
        this._fieldSettingsTab.show();
        $(this.element).find('.field-settings').addClass('DWF-active-tab');
    };

    ControlPanel.prototype.openFormSettingsTab = function () {
        this._hideTabs();
        this._formSettingsTab.show();
        $(this.element).find('.form-settings').addClass('DWF-active-tab');
    };

    ControlPanel.prototype.openAddFieldTab = function () {
        this._hideTabs();
        this._addFieldTab.show();
        $(this.element).find('.add-field').addClass('DWF-active-tab');
    };

    ControlPanel.prototype.disableSave = function () {
        this._formSettingsTab.disableSave();
    };

    ControlPanel.prototype.enableSave = function () {
        this._formSettingsTab.enableSave();
    };
});
