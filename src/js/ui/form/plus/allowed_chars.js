/**
 *
 * @compilation_level ADVANCED_OPTIMIZATIONS
 *
 * @requires paste/dom
 * @requires paste/event
 * @requires paste/util
 * @requires paste/guid
 * @module paste/ui/form/plus/allowed_chars
 *
 * @example
 * http://jsfiddle.net/lauckness/3cja7t8f/
 *
 * <input type="text" data-allowed-char-expr="\d" />
 * <input type="text" data-disallowed-char-expr="\d" />
 * <input type="text" data-allowed-char-expr="\d" data-disallowed-char-expr="\d" />
 *
 * <input type="number" data-allowed-char-expr="\d" />
 * <input type="number" data-disallowed-char-expr="\d" />
 * <input type="number" data-allowed-char-expr="\d" data-disallowed-char-expr="\d" />
 *
 */
paste['define'](
    'paste.ui.form.plus.allowed_chars',
    [
        'paste.dom',
        'paste.event',
        'paste.util',
        'paste.guid'
    ],
    function (module, dom, event, util, guid, undefined) {
        'use strict';

        var ALLOWED_CHAR_EXPR_DATA_ATTR = 'data-allowed-char-expr',
            DISALLOWED_CHAR_EXPR_DATA_ATTR = 'data-disallowed-char-expr',

            ObjectKeysFnRef = Object['keys'],
            has_initialized = false,

            disallowedElementExpressions = {},
            allowedElementExpressions = {},

            keypressSubscriptions = {},
            element,
            elementId,
            elements = [],
            elementsLength,

            inputValidationHandler = function inputValidationHandler (e, data) {
                var inputElement = event['getEventTarget'](e),
                    inputCharCode = (typeof(e['charCode']) !== 'undefined' && e['charCode'] !== null) ? e['charCode'] : ((typeof(e['which'])  !== 'undefined' && e['which'] !== null) ? e['which'] : e['keyCode']),
                    inputElementId = inputElement['id'],
                    allowedCharExpr = allowedElementExpressions[inputElementId] ? new RegExp(allowedElementExpressions[inputElementId], 'g') : null,
                    disallowedCharExpr = disallowedElementExpressions[inputElementId] ? new RegExp(disallowedElementExpressions[inputElementId], 'g') : null,
                    inputString,
                    matches;

                if (inputCharCode && inputCharCode > 0) {
                     inputString = String['fromCharCode'](inputCharCode);
                }

                if (inputString && allowedCharExpr) {
                    matches = inputString['match'](allowedCharExpr);
                    if (!matches) {
                        e['preventDefault']();
                        return false;
                    }
                }

                if (inputString && disallowedCharExpr) {
                    matches = inputString['match'](disallowedCharExpr);
                    if (matches) {
                        e['preventDefault']();
                        return false;
                    }
                }
            },

            initialize = function initialize(force) {
                if (has_initialized && !force) {
                    return
                } else if (has_initialized && force) {
                    var subKeys = ObjectKeysFnRef(keypressSubscriptions),
                        subKeysLength = subKeys['length'],
                        subscriptionKey,
                        subscription;

                    while (subKeysLength--) {
                        subscriptionKey = subKeys[subKeysLength];

                        // remove subs
                        subscription = keypressSubscriptions[subscriptionKey];
                        subscription['dispose']();
                        delete keypressSubscriptions[subscriptionKey];
                    }
                }
                elements = dom['querySelectorAll']('[' + ALLOWED_CHAR_EXPR_DATA_ATTR + '],[' + DISALLOWED_CHAR_EXPR_DATA_ATTR + ']');
                elementsLength = elements['length'];

                while (elementsLength --) {
                    element = elements[elementsLength];
                    elementId = element['id'] = (
                        element['id'] || guid['Guid']['create']()
                    );

                    allowedElementExpressions[elementId] = element['getAttribute'](ALLOWED_CHAR_EXPR_DATA_ATTR);
                    disallowedElementExpressions[elementId] = element['getAttribute'](DISALLOWED_CHAR_EXPR_DATA_ATTR);

                    keypressSubscriptions[elementId] = event['bind'](
                        'keypress',
                        element,
                        inputValidationHandler
                    );
                }

                has_initialized = true;
            },
            __ret;

        initialize();

        __ret = {
            'initialize': initialize
        };

        return __ret;
    }
);
