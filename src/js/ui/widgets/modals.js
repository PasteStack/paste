/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/io
 * @requires paste/formdata
 * @module paste/ui/widget/modals
 */

paste.define(
    'paste.ui.widget.modals',
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
            MODAL_CLASS = "modal-box",
            MODAL_BABY_CLASS = "modal-box-baby",
            overlay = dom.get("." + OVERLAY_CLASS, true)[0],
            modalBox = dom.get("." + MODAL_CLASS, true)[0],
            modalBuilder = function(
                content,
                overlay_closes_modal
                ) {
                var MODAL_FORM_CLASS = "modal-form",
                    overlay = document.createElement('div'),
                    modalBox = document.createElement('div'),
                    messageBox = document.createElement('div'),
                    modalContents,
                    modalForm,
                    addAdminForm,
                    addModalContents = function(modalContents) {
                        messageBox.innerHTML = modalContents;
                        modalBox.appendChild(messageBox);
                        document.body.appendChild(modalBox);
                    };

                overlay.className = OVERLAY_CLASS;
                document.body.appendChild(overlay);

                modalBox.className = MODAL_CLASS + " " + MODAL_BABY_CLASS;
                modalContents = content;
                addModalContents(modalContents);

                if (overlay_closes_modal) {
                    dom.get('.'+OVERLAY_CLASS, true)[0].addEventListener('click', removeModal, false);
                }

                document.addEventListener('click', removeModalHandler, false);
            },
            removeModalHandler = function(e) {
                var target = event['getEventTarget'](e),
                    targetClass = target.className,
                    isCloseButton = targetClass === OVERLAY_CLOSE_CLASS ||
                                    target.id === OVERLAY_CANCEL_ID;

                if (isCloseButton) {removeModal()}
            },
            removeModal = function() {
                overlay = dom.get("." + OVERLAY_CLASS, true)[0];
                modalBox = dom.get("." + MODAL_CLASS, true)[0];
                if (overlay && modalBox) {
                    document.body.removeChild(overlay);
                    document.body.removeChild(modalBox);
                    document.removeEventListener('click', removeModalHandler, false);
                }
            },
            init = function(){
                if (overlay && modalBox) {
                    document.addEventListener('click', removeModalHandler, false);
                }
            };

        init();
        module['modalBuilder'] = modalBuilder;

    }
);
