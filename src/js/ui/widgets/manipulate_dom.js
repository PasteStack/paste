/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/io
 * @requires paste/formdata
 * @module paste/ui/widget/manipulate_dom
 */

paste.define(
    'paste.ui.widget.manipulate_dom',
    [
        'paste.dom',
        'paste.util',
        'paste.event',
        'paste.io',
        'paste.formdata'
    ],
    function (module, dom, util, event, io, FormData) {
        'use strict';
        var OVERLAY_CLASS = "overlay",
            OVERLAY_CLOSE_CLASS = "overlay-close",
            OVERLAY_CANCEL_ID = "overlay_cancel",
            OVERLAY_CONFIRM_ID = "overlay_cancel",
            OVERLAY_BUTTON_CLASS = "overlay-button",
            MODAL_CLASS = "modal-box",
            MODAL_BABY_CLASS = "modal-box-baby",
            MODAL_MOMMA_CLASS = "modal-box-momma",
            MODAL_PAPA_CLASS = "modal-box-papa",
            MODAL_BABY_TYPES = [],
            replaceDOMContent = function(oldElement, newContent) {
                //replaceDOMContent(CSS_CLASS OR oldElement, newContent);
                var oldEl,
                    newEl;

                if (typeof oldElement === "string") {
                    oldEl = dom.get(oldElement, true)[0]
                }
                else if (oldElement && oldElement.nodeName) {
                    oldEl = oldElement;
                }
                else {
                    throw new Error("Invalid old content passed.")
                }
                newEl = oldEl.cloneNode();
                newEl.innerHTML = newContent;
                oldEl.parentNode.replaceChild(newEl, oldEl);
//                document.body.scrollTop = document.documentElement.scrollTop = 0;
            },
            coverDOMContent = function(oldElement, newContent, newContentId) {
                var oldEl,
                    newEl;

                if (typeof oldElement === "string") {
                    oldEl = dom.get(oldElement, true)[0]
                }
                else if (oldElement && oldElement.nodeName) {
                    oldEl = oldElement;
                }
                else {
                    throw new Error("Invalid old content passed.")
                }

                newEl = oldEl.cloneNode();
                newEl.id = newContentId;
                newEl.innerHTML = newContent;
                oldEl.parentNode.appendChild(newEl);

                dom.hide(oldEl);
//                document.body.scrollTop = document.documentElement.scrollTop = 0;
            };

        module['replaceDOMContent'] = replaceDOMContent;
        module['coverDOMContent'] = coverDOMContent;

        console.log('in manipulate_dom js');

    }
);
