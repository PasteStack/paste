/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/io
 * @requires paste/formdata
 * @requires paste/ui/widget/modals
 * @module paste/ui/widget/lists
 */

paste.define(
    'paste.ui.widget.lists',
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
        var LIST_CLASS = "interactive",
            LIST_ITEM_SUBMIT_CLASS = "list-item-submit",
            modalHandler = function(e) {
                var $el = event['getEventTarget'](e),
                    data,
                    modalContent;

                if( ($el.tagName.toUpperCase() == "INPUT" && ($el['type'].toUpperCase() != "CHECKBOX") &&
                    ($el['type'].toUpperCase() != "RADIO")) || ($el.tagName.toUpperCase() == "BUTTON" &&
                    $el.getAttribute('formaction')) ) {
                        e['preventDefault']();
                } else {
                    return;
                }
                data = $el.dataset;

                if ($el.classList.contains(LIST_ITEM_SUBMIT_CLASS)){
                    var listForm = $el.parentNode,
                        elementFormAction = $el.getAttribute('formaction'),
                        formData,
                        listFormSuccess = function (response) {
//                            console.log("Resend modal Success! response: " +response);
                            modalContent = response;
                            modals.modalBuilder(modalContent, true);
                        },
                        listFormError = function (response, status, error) {
                            modalContent = "An error has occurred. Please try again later.";
                            modals.modalBuilder(modalContent, true);
                        };

//                    console.log("listForm: " + listForm);
                    if(listForm.tagName.toLowerCase() == "fieldset") {
                        formData = formDataFromFieldSet(listForm);
                    }
                    else {
                        formData = new FormData(listForm);
                    }

                    io[(listForm['method'] || 'post').toLowerCase()](
                        (elementFormAction || listForm['action'] || window.location),
                        formData,
                        listFormSuccess,
                        listFormError
                    );
                }
            },
            formDataFromFieldSet = function($fieldset) {
                var data = {};
                // For this case, we can ignore non-input fields (e.g. radio, checkbox, etc)
                util['each']($fieldset.getElementsByTagName('input'), function($input) {
                    data[$input['name']] = $input['value'];
                });
                return data;
            };

        util['each'](dom.get("."+LIST_CLASS, true), function listActionHandlerIterator(lists, index) {
            event['bind']('click', lists, modalHandler)
        });

    }
);
