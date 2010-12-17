{% include "wysiwyg_forms/jquery.js" %}

{% include "wysiwyg_forms/jquery.ui.core.js" %}
{% include "wysiwyg_forms/jquery.ui.widget.js" %}
{% include "wysiwyg_forms/jquery.ui.tabs.js" %}

{% include "wysiwyg_forms/underscore.js" %}

{% include "wysiwyg_forms/backbone.js" %}

(function () {

    {% include "wysiwyg_forms/dwf.intro.js" %}

    {% include "wysiwyg_forms/dwf.utils.js" %}

    {% include "wysiwyg_forms/dwf.models.js" %}

    {% include "wysiwyg_forms/dwf.views.js" %}

    {% include "wysiwyg_forms/dwf.controllers.js" %}

    {% include "wysiwyg_forms/dwf.transactions.js" %}

    {% include "wysiwyg_forms/dwf.outro.js" %}

}());