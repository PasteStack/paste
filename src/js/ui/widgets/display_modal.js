/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/io
 * @requires paste/formdata
 * @requires paste/ui/widget/modals
 * @module paste/ui/widget/display_modal
 */

paste.define(
    'paste.ui.widget.display_modal',
    [
        'paste.dom',
        'paste.util',
        'paste.event',
        'paste.io',
        'paste.formdata',
        'paste.ui.widget.modals'
    ],
    function (module, dom, util, event, io, FormData, modals) {
        'use strict';
        var MODAL_BUILDER_CLASS = "modal-builder",
            modalHandler = function(e) {
                var $el = event['getEventTarget'](e),
                    dataSet,
                    formData,
                    formEl,
                    modalAction,
                    modalMethod,
                    formId,
                    modalContent;

                e.preventDefault();
                e.returnValue = false;

                modalAction = $el.getAttribute('data-action');
                modalMethod = $el.getAttribute('data-method');
                formId = $el.getAttribute('data-form-id');

                if (formId) {
                    formEl = dom.get(formId);
                    if (formEl) {
                        formData = new FormData(formEl);
                    }
                }

                if (modalAction && modalMethod){
                    var useOverlay = $el.getAttribute('data-use-overlay'),
                        overClosesModal = $el.getAttribute('data-overlay-closes-modal'),
                        requestSuccess = function (response) {
                            modalContent = response;
                            modals.modalBuilder(modalContent, (overClosesModal || true));
                        },
                        requestError = function (response, status, error) {
                            modalContent = "An error has occurred. Please try again later.";
                            modals.modalBuilder(modalContent, (overClosesModal || true));
                        };

                    io[(modalMethod || 'POST').toLowerCase()](
                        (modalAction || window.location),
                        formData || {},
                        requestSuccess,
                        requestError
                    );
                }
            };

        util['each'](dom.get("."+MODAL_BUILDER_CLASS, true), function ($el) {
            event['bind']('click', $el, modalHandler)
        });

    }
);
