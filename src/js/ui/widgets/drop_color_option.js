/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @module paste/ui/widget/drop_color_option
 */

paste.define(
    'paste.ui.widget.drop_color_option',
    [
        'paste.dom',
        'paste.util',
        'paste.event'
    ],
    function (module, dom, util, event) {
        'use strict';
        // on change of color, check to see if any sizes selected.
        // If so, get size from target radio, get radios of target color (select size of radio),
        // deselect target radio
        var DROP_FORM_CLASS = "selection-options",
            PRODUCT_CLASS = "product-choice",
            COLOR_OPTION_CLASS = "color-option",
            elements = document.getElementsByName("product_id"),
            clickHandler = function(e) {
                var el = e.target,
                    size,
                    color,
                    radioEl;
                if (el.classList.contains(COLOR_OPTION_CLASS)) {
                    color = el.dataset.color;
                    for (var i=0; i <= elements.length; i++) {
                        if (elements[i].checked) {
                            if(elements[i].dataset.hasSingleSize) return true;
                            size = elements[i].dataset.size;
                            elements[i].checked = false;
                            break;
                        }
                    }
                }
                if (size) {
                    radioEl = document.querySelector("." + PRODUCT_CLASS + "." + color + "." + size);
                    radioEl.checked = true;
                }
            },
            formEl;

        formEl = document.getElementsByClassName(DROP_FORM_CLASS)[0];
        event['bind']('click', formEl, clickHandler);

    }
);
