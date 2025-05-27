/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/io
 * @requires paste/formdata
 * @requires paste/ui/widget/message
 * @module paste/ui/widget/inline_edit
 */

paste.define(
    'paste.ui.widget.inline_edit',
    [
        'paste.dom',
        'paste.util',
        'paste.event',
        'paste.io',
        'paste.formdata',
        'paste.ui.widget.message'
    ],
    function (module, dom, util, event, io, FormData, message) {
        'use strict';
        var INLINE_EDIT_FORM_ID = "inline_edit_form",
            INLINE_EDIT_BUTTON_ID = "inline_edit_button",
            INLINE_EDIT_CANCEL_ID = "inline_edit_cancel",
            INLINE_ERROR_BOX_CLASS = "error-box-small",
            UPDATE_PROGRAM_NAME_CLASS = "update-program-name",
            inlineEditForm = dom.get(INLINE_EDIT_FORM_ID),
            inlineEditField = dom.get("inline_edit_field"),
            defaultStateEl = dom.get(".header-heading", true)[0],
            editStateEl = dom.get(".header-heading-edit", true)[0],
            elementsToUpdate = document.getElementsByClassName(UPDATE_PROGRAM_NAME_CLASS),
            toggleEditState = function() {
//                console.log("in toggleEditState");
                if (editStateEl.style.display.toLowerCase() === "none") {
                    dom.hide(defaultStateEl);
                    dom.show(editStateEl);
                    inlineEditField.focus();
                }
                else if (defaultStateEl.style.display.toLowerCase() === "none") {
                    dom.hide(editStateEl);
                    dom.show(defaultStateEl);
                    inlineEditField.value = defaultStateEl.innerHTML;
                }
            },
            toggleEditHandler = function(e) {
                e['preventDefault']();
                toggleEditState();
            },
            submitInlineHandler = function(e) {
                e['preventDefault']();

                var formData = new FormData(inlineEditForm),
                    inlineEditSuccess = function(response) {
//                        defaultStateEl.innerHTML = response.data.name;
                        defaultStateEl.innerHTML = response.data.name;
                        inlineEditField.value = response.data.name;
                        util.each(elementsToUpdate,function($el){
                            $el.innerHTML = response.data.name;
                        });
                        toggleEditState();
                    },
                    inlineEditError = function(response) {
                        message.messageBox(
                            editStateEl,
                            "<em>Error</em>: This name already exists. Please choose another.",
                            INLINE_ERROR_BOX_CLASS,
                            false,
                            true
                        )
                    };

                io[(inlineEditForm['method'] || 'post').toLowerCase()](
                    (inlineEditForm['action'] || window.location),
                    formData,
                    inlineEditSuccess,
                    inlineEditError
                );
            };

        if (!inlineEditForm) {
            return;
        }

        event['bind']('click', dom.get(INLINE_EDIT_BUTTON_ID), toggleEditHandler);

        event['bind']('click', dom.get(INLINE_EDIT_CANCEL_ID), toggleEditHandler);

        event['bind']('submit', inlineEditForm, submitInlineHandler);

        console.log('in inline_edit js');
    }
);
