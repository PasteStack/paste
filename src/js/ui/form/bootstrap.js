/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */
/**
 *
 * @compilation_level ADVANCED_OPTIMIZATIONS
 *
 * @requires paste
 * @requires paste/dom
 * @requires paste/event
 * @requires paste/util
 * @requires paste/ui/form/validity
 * @module paste/ui/form/bootstrap
 */

paste['define'](
    "paste.ui.form.bootstrap",
    [
        "paste.dom",
        "paste.event",
        "paste.util",
        "paste.guid",
        'paste.ui.form.validity'
    ],
    function (module, dom, event, util, guid, validity) {
        "use strict";

        var BIND_KEY = 'bind',
            SUBMIT_KEY = 'submit',
            CHANGE_KEY = 'change',
            FOCUSOUT_KEY = 'focusout',
            KEYUP_KEY = 'keyup',
            CHECK_VALIDITY_KEY = 'checkValidity',
            TARGET_ELEMENT_KEY = 'getEventTarget',
            PREVENT_DEFAULT_KEY = 'preventDefault',
            DATA_PREFIX_KEY = 'data-',
            VALIDITY_DATA_PREFIX_KEY = DATA_PREFIX_KEY + 'validity-',
            VALID_KEY = 'valid',
            INVALID_KEY = 'invalid',
            forms = document['getElementsByTagName']('form'),
            formLen = forms['length'],
            changeSubscriptions = {},
            focusOutSubscriptions = {},
            keyUpSubscriptions = {},
            submitSubscriptions = {},
            formEl,
            formElId,
            invalidEvents = {},
            setValidityAttributes = function setValidityAttributes(el, isValid) {
                el.setAttribute(
                    VALIDITY_DATA_PREFIX_KEY + VALID_KEY,
                    isValid
                );
            },
            formSubmitHandler = function formSubmitHandler(e, data) {
                var targetEl = event[TARGET_ELEMENT_KEY](e),
                    formEl = this,
                    validityStateValid,
                    notAllowedState;

                if (!targetEl) {
                    e[PREVENT_DEFAULT_KEY]();
                }

                notAllowedState = formEl['getAttribute']('data-not-allowed') === 'true';

                validity(targetEl);
                validityStateValid = formEl[CHECK_VALIDITY_KEY]();

                if (!validityStateValid || notAllowedState) {
                    e[PREVENT_DEFAULT_KEY]();
                } else {
                    setValidityAttributes(formEl, true);
                }

            },
            inputUpdateHandler = function inputUpdateHandler(e, data) {
                var targetEl = event[TARGET_ELEMENT_KEY](e),
                    formEl = this;

                if (!targetEl) {
                    return;
                }

                validity(targetEl);
                if (targetEl[CHECK_VALIDITY_KEY]()) {
                    validity(formEl);
                    setValidityAttributes(targetEl, true);
                    setValidityAttributes(formEl, formEl[CHECK_VALIDITY_KEY]());
                }
            },
            inputInvalidHandler = function inputInvalidHandler(e, data) {
                var targetEl = event[TARGET_ELEMENT_KEY](e),
                    formEl = this;

                setValidityAttributes(targetEl, false);
                setValidityAttributes(formEl, false);
            };

        while (formLen--) {
            formEl = forms[formLen];
            formEl['noValidate'] = true;

            formElId = formEl['id'];
            if (!formElId) {
                formEl['id'] = formElId = guid['Guid']['create']();
            }

            validity(formEl);
            setValidityAttributes(formEl, formEl[CHECK_VALIDITY_KEY]());

            if (!submitSubscriptions[formElId]) {
                submitSubscriptions[formElId] = event[BIND_KEY](
                    SUBMIT_KEY,
                    formEl,
                    formSubmitHandler,
                    formEl
                );
            }

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

            if (!invalidEvents[formElId]) {
                invalidEvents[formElId] = new event['Event'](
                    formEl,
                    INVALID_KEY
                );
                invalidEvents[formElId][BIND_KEY](
                    inputInvalidHandler,
                    formEl,
                    null,
                    true
                )
            }
        }
    }
);