/**
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/io
 * @requires paste/formdata
 * @requires paste/ui/widget/message
 * @module paste/ui/widget/basic_form
 */

paste.define(
    'paste.ui.widget.basic_form',
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
        var ADD_ITEM_FORM_ID = "add_item_form",
            ADD_ITEM_BUTTON_ID = "add_item_button",
            ADD_ITEM_BLOCK_CLASS = "add-item-block",
            addFormFieldHandler = function(e) {
                e['preventDefault']();
                var target = event['getEventTarget'](e),
                    formEl = dom.get(ADD_ITEM_FORM_ID),
                    newField = dom.get('.'+ADD_ITEM_BLOCK_CLASS, true)[0];

                if (target.id === ADD_ITEM_BUTTON_ID) {
                    var newFieldClone = newField.cloneNode(true),
                        inputField = newFieldClone.firstElementChild.nextElementSibling;
                    inputField.value = "";
                    inputField.removeAttribute('required');
                    formEl.insertBefore(newFieldClone, target.parentElement);
                    inputField.focus();
                }
            };

        event['bind']('click', dom.get(ADD_ITEM_BUTTON_ID), addFormFieldHandler);

    }
);
