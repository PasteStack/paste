/**
 * @requires paste/dom
 * @requires paste/event
 * @module paste/ui/form/plus/brand_select
 */

paste.define(
    'paste.ui.form.plus.brand_select',
    [
        'paste.dom',
        'paste.event'
    ],
    function (brand_select_module, dom, event, undefined) {
        'use strict';
        var WRAPPER_CLASS = "brand-select",
            VALUE_CLASS = "value",
            SELECT_SELECTOR = "." + WRAPPER_CLASS + " > select",
            init,
            setValue,
            checkElement,
            changeCallback;

        setValue = function($el) {
            var $value = $el['previousSibling'];

            if(dom['hasCssClass']($value, VALUE_CLASS)) {
                $value['innerHTML'] = $el['options'][$el['selectedIndex']]['text'];
            }
        };

        checkElement = function($el, cb) {
            if($el['tagName']['toUpperCase']() == "SELECT" && dom['hasCssClass']($el['parentElement'], WRAPPER_CLASS)) {
                cb($el);
            }
        };

        changeCallback = function(e) {
            checkElement(event['getEventTarget'](e), setValue);
        };

        event['bind']('change', window['document']['body'], changeCallback);
        event['bind']('keyup', window['document']['body'], changeCallback);

        init = function($el) {
            var $selects = dom['querySelectorAll'](SELECT_SELECTOR, $el),
                i,
                len;

            for(i = 0, len = $selects['length']; i<len; i++) {
                setValue($selects[i]);
            }
        };

        brand_select_module['init'] = init;

        init();
    }
);
