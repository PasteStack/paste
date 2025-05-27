/**
 * @requires paste/util
 * @requires paste/event
 * @module paste/ui/form/plus/prevent_double_submit
 */

paste.define(
    'paste.ui.form.plus.prevent_double_submit',
    [
        'paste.util',
        'paste.event'
    ],
    function (module, util, event) {
        'use strict';

        var DATA_ATTR = "data-prevent-double-submit",
            init = function($parent) {
                $parent = $parent || window.document;
                util['each']($parent.getElementsByTagName('input'),function($el){
                    if($el.hasAttribute(DATA_ATTR) && $el.getAttribute(DATA_ATTR).toLowerCase() == "true") {
                        var $form = $el;

                        while($form && $form.tagName.toLowerCase() != 'form') {
                            $form = $form.parentElement;
                        }

                        if($form) {
                            event['bind']('submit', $form, function() {
                                $el.disabled = true;
                            });
                        }
                    }
                });
            };

        init();

        module['init'] = init;
    }
);
