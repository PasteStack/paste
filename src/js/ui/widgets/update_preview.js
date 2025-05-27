/**
 * @requires paste/dom
 * @requires paste/event
 * @requires paste/util
 * @requires paste/guid
 * @module paste/ui/widget/update_preview
 */

paste.define(
    'paste.ui.widget.update_preview',
    [
        'paste.dom',
        'paste.event',
        'paste.util',
        'paste.guid'
    ],
    function (module, dom, event, util, guid) {
        'use strict';

        var UPDATE_FOR_DATA_ATTR = 'data-update-for-name',
            UPDATE_ATTR_DATA_ATTR = 'data-update-attr',
            UPDATE_PREFIX_DATA_ATTR = 'data-update-prefix',
            UPDATE_SUFFIX_DATA_ATTR = 'data-update-suffix',
            UPDATE_DEFAULT_VALUE_DATA_ATTR = 'data-update-default-value',
            BIND_KEY = 'bind',
            CHANGE_KEY = 'change',
            FOCUSOUT_KEY = 'focusout',
            KEYUP_KEY = 'keyup',
            TARGET_ELEMENT_KEY = 'getEventTarget',

            changeSubscriptions = {},
            focusOutSubscriptions = {},
            keyUpSubscriptions = {},

            updatableElements = dom['querySelectorAll']('[' + UPDATE_FOR_DATA_ATTR + ']'),
            updatableElementsDict = {},

            forms = document['getElementsByTagName']('form'),
            formLen = forms['length'],
            formEl,
            formElId,

            createUpdatedElementsDict = function createUpdatedElementsDict(element, index) {
                var forId = element['getAttribute'](UPDATE_FOR_DATA_ATTR);
                updatableElementsDict[forId] = updatableElementsDict[forId] || [];
                updatableElementsDict[forId]['push'](element);
            },
            updateElement = function updateElement(element, index) {
                var targetEl = this,
                    defaultValue = element['getAttribute'](UPDATE_DEFAULT_VALUE_DATA_ATTR) || '',
                    updatePrefix = element['getAttribute'](UPDATE_PREFIX_DATA_ATTR) || '',
                    updateSuffix = element['getAttribute'](UPDATE_SUFFIX_DATA_ATTR) || '',
                    attrToUpdate = element['getAttribute'](UPDATE_ATTR_DATA_ATTR) || 'innerHTML',
                    attrValName,
                    attrValSetter,
                    attributeChain,
                    attributeChainIndex = 0,
                    attributeChainLen;

                if (util['arrayContains'](attrToUpdate, '.')) {
                    attributeChain = attrToUpdate.split('.');
                } else {
                    attributeChain = [attrToUpdate];
                }
                attributeChainLen = attributeChain['length'];

                attrValSetter = element;
                for (attributeChainIndex; attributeChainIndex < attributeChainLen; attributeChainIndex += 1) {
                    attrValName = attributeChain[attributeChainIndex];
                    attrValSetter[attrValName] = attrValSetter[attrValName] || {};

                    if (attributeChainIndex === (attributeChainLen - 1)) {
                        break;
                    }

                    attrValSetter = attrValSetter[attrValName];
                }

                attrValSetter[attrValName] = updatePrefix + (targetEl['value'] || defaultValue) + updateSuffix;
            },
            inputUpdateHandler = function inputUpdateHandler(e, data) {
                var targetEl = event[TARGET_ELEMENT_KEY](e),
                    elementsToUpdate;

                if (!targetEl) {
                    return;
                }

                elementsToUpdate = updatableElementsDict[targetEl['name']];
                if (!elementsToUpdate || !elementsToUpdate['length']) {
                    return;
                }

                util['each'](elementsToUpdate, updateElement, targetEl);
            };

        util['each'](updatableElements, createUpdatedElementsDict);

        while (formLen--) {
            formEl = forms[formLen];
            formElId = formEl['id'] = (formEl['id'] || guid['Guid']['create']());

            if (!changeSubscriptions[formElId]) {
                changeSubscriptions[formElId] = event[BIND_KEY](
                    CHANGE_KEY,
                    formEl,
                    inputUpdateHandler,
                    formEl
                );
            }

            if (!focusOutSubscriptions[formElId]) {
                focusOutSubscriptions[formElId] = event[BIND_KEY](
                    FOCUSOUT_KEY,
                    formEl,
                    inputUpdateHandler,
                    formEl
                );
            }

            if (!keyUpSubscriptions[formElId]) {
                keyUpSubscriptions[formElId] = event[BIND_KEY](
                    KEYUP_KEY,
                    formEl,
                    inputUpdateHandler,
                    formEl
                );
            }
        }
    }
);
