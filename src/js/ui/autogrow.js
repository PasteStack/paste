/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @module paste/ui/autogrow
 */

paste.define(
    'paste.ui.autogrow',
    [
        'paste.dom',
        'paste.util',
        'paste.event'
    ],
    function (module, dom, util, event) {
        'use strict';
        var AUTOGROW_CLASS = "autogrow",
            autoGrowElement = function(el) {
                var elScrollHeight = el.scrollHeight;

                if (elScrollHeight > el.style.height.replace(/[^0-9]/g,'')) {
                    el.style.height = elScrollHeight + 'px';
                }
            },
            autoGrowHandler = function(e) {
                var el = event['getEventTarget'](e)
                autoGrowElement(el);
            };

        util['each'](dom.get("."+AUTOGROW_CLASS, true), function autogrowHandlerIterator(el, index) {
            event['bind']('keyup', el, autoGrowHandler);
            autoGrowElement(el);
        });
    }
);
