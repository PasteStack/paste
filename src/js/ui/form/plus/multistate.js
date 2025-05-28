/*jslint white:false plusplus:false browser:true nomen:false */
/*globals Globals, paste */

/**
 *
 * @compilation_level ADVANCED_OPTIMIZATIONS
 *
 * @requires paste
 * @requires paste/util
 * @requires paste/dom
 * @requires paste/event
 * @requires paste/guid
 * @module paste/ui/form/plus/multistate
 *
 * @todo add url encoding
 * @todo add support for other trigger types, such as anchor tags
 *
 * @example
 * http://jsfiddle.net/lauckness/f2u3r/
 *
 * <style type="text/css">
 *     [data-multistate-value] { display:none; }
 *     input[data-multistate-key]:checked ~ [data-multistate-state] { display: block; }
 * </style>
 *
 * <input id="my-id-1" type="radio" data-multistate-key="area1" value="tab1" checked="checked"/>
 * <label for="my-id-1">tab 1</label>
 * <div data-multistate-key="area1" data-multistate-value="tab1">area 1, content 1</div>
 * <input id="my-id-2" type="radio" data-multistate-key="area1" value="tab2"/>
 * <label for="my-id-2">tab 2</label>
 * <div data-multistate-key="area1" data-multistate-value="tab2">area 1, content 2</div>
 *
 * <input id="my-id-3" type="radio" data-multistate-key="area2" value="tab1"/>
 * <label for="my-id-3">tab 3</label>
 * <div data-multistate-key="area2" data-multistate-value="tab1">area 2, content 1</div>
 * <input id="my-id-4" type="radio" data-multistate-key="area2" value="tab2"/>
 * <label for="my-id-4">tab 4</label>
 * <div data-multistate-key="area2" data-multistate-value="tab2">area 2, content 2</div>
 *
 */

paste['define'](
    'paste.ui.form.plus.multistate',
    [
        'paste.util',
        'paste.dom',
        'paste.event',
        'paste.guid'
    ],
    function (module, util, dom, event, guid, multistate) {
        'use strict';

        var __ret,

        // region Constants
            HASH_CHANGE = 'hashchange',
            POP_STATE = 'popstate',
            KEY_DATA_ATTR = 'data-multistate-key',
            VALUE_DATA_ATTR = 'data-multistate-value',
            SELECTED_CLASS_PREFIX = 'multistate-state',
            SELECTED_DATA_ATTR = 'data-' + SELECTED_CLASS_PREFIX,
            STATE_POP_EVENT_NAME = 'multistatepop',
        // endregion

        // region Locals
            ObjectKeysFnRef = Object['keys'],
            lengthProp = 'length',
            has_initialized = false,
            statePopEvent = new event['Event'](window, STATE_POP_EVENT_NAME),
            moduleGuid = guid['Guid']['create'](),

            popstateSubscription,
            hashchangeSubscription,

            stateElements,
            stateElement,
            stateElementId,
            stateElementsLength,
            stateElementKey,
            stateElementValueKey,
            stateTriggerElementsDict,
            stateContentElementsDict,
            stateValueSelectedDict,
            initialStateValueSelectedDict,
            stateElementChangeSubscriptions,

        // region Utility
            deserializeState = function deserializeState(stateString) {
                var stateParts,
                    statePartsLength,
                    stateKeyValue,
                    deserialized = {};

                stateString = stateString || window['location']['hash'];

                if (stateString && util['stringStartsWith'](stateString, '#')) {
                    stateString = stateString['slice'](1, stateString[lengthProp])
                }

                if (stateString) {
                    stateParts = stateString['split'](',')
                }

                if (stateParts) {
                    statePartsLength = stateParts[lengthProp];
                }

                if (statePartsLength) {
                    while (statePartsLength--) {
                        stateKeyValue = stateParts[statePartsLength]['split'](':');
                        if (stateKeyValue && stateKeyValue[lengthProp] > 1) {
                            deserialized[stateKeyValue[0]] = stateKeyValue[1];
                        }
                    }
                }

                return deserialized;
            },
            serializeState = function serializeState(stateValueSelectedDict) {
                var keys = ObjectKeysFnRef(stateValueSelectedDict),
                    keysLen = keys[lengthProp],
                    key,
                    serialized = '';

                while (keysLen--) {
                    key = keys[keysLen];
                    if (serialized[lengthProp]) {
                        serialized += ','
                    }
                    serialized += (key + ':' + stateValueSelectedDict[key])
                }

                return serialized;
            },
        // endregion

            updateMultiState = function updateMultiState(updatedStateDict) {
                var availableKeys = ObjectKeysFnRef(stateContentElementsDict),
                    availableKeysLength = availableKeys[lengthProp],
                    keys = updatedStateDict ? ObjectKeysFnRef(updatedStateDict) : [],
                    keysLength = keys[lengthProp],
                    key,
                    value,
                    unselectedValue,
                    unselectedContentElementsDict = {},
                    unselectedContentElementsDictKeys,
                    unselectedContentElementsDictKeysLength,
                    selectedContentElementsDict = {},
                    selectedContentElementsDictKeys,
                    selectedContentElementsDictKeysLength,
                    updatedStateValueSelectedDict = {},
                    updatableElement,
                    updatableElementsLength;

                while (keysLength--) {
                    key = keys[keysLength];
                    value = updatedStateDict[key];

                    if (value && stateContentElementsDict[key] && stateContentElementsDict[key][value]) {
                        availableKeys['pop'](key);

                        unselectedValue = stateValueSelectedDict[key];
                        if (unselectedValue && unselectedValue !== value) {
                            unselectedContentElementsDict[key] = stateContentElementsDict[key][unselectedValue];
                            selectedContentElementsDict[key] = stateContentElementsDict[key][value];
                        } else if (!unselectedValue) {
                            selectedContentElementsDict[key] = stateContentElementsDict[key][value];
                        }

                        updatedStateValueSelectedDict[key] = value;
                    }
                }

                // add remaining keys to unselected dict
                while (availableKeysLength--) {
                    key = keys[keysLength];
                    value = stateContentElementsDict[key];

                    unselectedValue = stateValueSelectedDict[key];
                    if (unselectedValue && unselectedValue !== value) {
                        unselectedContentElementsDict[key] = stateContentElementsDict[key][unselectedValue]
                    }
                }

                // remove attributes
                unselectedContentElementsDictKeys = ObjectKeysFnRef(unselectedContentElementsDict);
                unselectedContentElementsDictKeysLength = unselectedContentElementsDictKeys[lengthProp];
                while (unselectedContentElementsDictKeysLength--) {
                    key = unselectedContentElementsDictKeys[unselectedContentElementsDictKeysLength];
                    value = stateContentElementsDict[key][stateValueSelectedDict[key]];
                    updatableElementsLength = value[lengthProp];
                    while (updatableElementsLength--) {
                        updatableElement = value[updatableElementsLength];
                        updatableElement['removeAttribute'](SELECTED_DATA_ATTR);
                        dom['removeCssClass'](updatableElement, SELECTED_CLASS_PREFIX + '-' + key + '-' + stateValueSelectedDict[key]);
                    }
                }

                // add attributes
                selectedContentElementsDictKeys = ObjectKeysFnRef(selectedContentElementsDict);
                selectedContentElementsDictKeysLength = selectedContentElementsDictKeys[lengthProp];
                while (selectedContentElementsDictKeysLength--) {
                    key = selectedContentElementsDictKeys[selectedContentElementsDictKeysLength];
                    value = stateContentElementsDict[key][updatedStateDict[key]];

                    // set the updatableElement temporarily to the checkbox
                    updatableElement = stateTriggerElementsDict[key][updatedStateDict[key]];
                    updatableElement['checked'] = true; // we may not need to write here everytime, but do it anyway

                    updatableElementsLength = value[lengthProp];
                    while (updatableElementsLength--) {
                        updatableElement = value[updatableElementsLength];
                        updatableElement['setAttribute'](SELECTED_DATA_ATTR, updatedStateDict[key]);
                        dom['addCssClass'](updatableElement, SELECTED_CLASS_PREFIX + '-' + key + '-' + updatedStateDict[key]);
                    }
                }

                stateValueSelectedDict = updatedStateValueSelectedDict;
                statePopEvent['fire'](stateValueSelectedDict);
            },

        // region Event Handling
            stateChangeHandler = function stateChangeHandler(e) {
                var stateInputElement = event['getEventTarget'](e),
                    stateInputKey = stateInputElement['getAttribute'](KEY_DATA_ATTR),
                    currentState = deserializeState() || stateValueSelectedDict;

                currentState[stateInputKey] = stateInputElement['value'];

                window['history']['pushState'](
                    currentState,
                    '',
                    '#' + serializeState(currentState)
                );

                popStateChangeHandler({
                    'state': currentState
                });
            },
            genericStateChangeHandler = function genericStateChangeHandler(e) {
                var desiredStateDict = e['state'];

                /*
                this is a hack. in certain browsers (lookin' at you IE), popstate
                doesn't fire on hashchange. in other browsers, both fire but
                popstate fires first. so, we take whatever event we get first,
                then detach the other.
                 */
                if (event['type'] && event['type'].toLowerCase() === POP_STATE) {
                    hashchangeSubscription['dispose']();
                    hashchangeSubscription = null;
                } else if (event['type'] && event['type'].toLowerCase() === HASH_CHANGE) {
                    popstateSubscription['dispose']();
                    popstateSubscription = null;
                }

                if (!desiredStateDict) {
                    desiredStateDict = deserializeState()
                }

                if (!desiredStateDict) {
                    desiredStateDict = stateValueSelectedDict;
                }

                updateMultiState(desiredStateDict);
            },
        // endregion

        // region Initialization
            initialize = function initialize(force) {
                if (has_initialized && !force) {
                    return
                } else if (has_initialized && force) {
                    var subKeys = ObjectKeysFnRef(stateElementChangeSubscriptions),
                        subKeysLength = subKeys[lengthProp],
                        subscriptionKey,
                        subscription;

                    while (subKeysLength--) {
                        subscriptionKey = subKeys[subKeysLength];
                        subscription = stateElementChangeSubscriptions[subscriptionKey];
                        subscription['dispose']();
                        delete stateElementChangeSubscriptions[subscriptionKey];
                    }

                }

                stateElements = dom['querySelectorAll']('[' + KEY_DATA_ATTR + ']');
                stateElementsLength = stateElements[lengthProp];
                stateTriggerElementsDict = {};
                stateContentElementsDict = {};
                stateValueSelectedDict = {};
                stateElementChangeSubscriptions = {};

                initialStateValueSelectedDict = deserializeState();
                if (!ObjectKeysFnRef(initialStateValueSelectedDict)[lengthProp]) {
                    initialStateValueSelectedDict = null;
                }

                while (stateElementsLength--) {
                    stateElement = stateElements[stateElementsLength];

                    stateElementKey = stateElement['getAttribute'](KEY_DATA_ATTR);
                    if (stateElementKey && !stateContentElementsDict[stateElementKey]) {
                        stateContentElementsDict[stateElementKey] = {
                        }
                    }
                    if (stateElementKey && !stateTriggerElementsDict[stateElementKey]) {
                        stateTriggerElementsDict[stateElementKey] = {
                        }
                    }

                    stateElementValueKey = stateElement['value'] || stateElement['getAttribute'](VALUE_DATA_ATTR);
                    if (stateElementValueKey && stateContentElementsDict[stateElementKey] && !stateContentElementsDict[stateElementKey][stateElementValueKey]) {
                        stateContentElementsDict[stateElementKey][stateElementValueKey] = []
                    }
                    if (stateElementValueKey && stateTriggerElementsDict[stateElementKey] && !stateTriggerElementsDict[stateElementKey][stateElementValueKey]) {
                        stateTriggerElementsDict[stateElementKey][stateElementValueKey] = []
                    }

                    if (stateElement['hasAttribute'](VALUE_DATA_ATTR)) {
                        stateContentElementsDict[stateElementKey][stateElementValueKey]['push'](stateElement)
                    } else if (stateElement['value']) {
                        stateTriggerElementsDict[stateElementKey][stateElementValueKey] = stateElement;

                        stateElementId = stateElement['id'] = (
                            stateElement['id'] || guid['Guid']['create']()
                            );
                        stateElement['name'] = stateElementKey + '$' + moduleGuid;

                        if (stateElement['checked']) {
                            if (!initialStateValueSelectedDict) {
                                initialStateValueSelectedDict = {};
                                initialStateValueSelectedDict[stateElementKey] = stateElement['value'];
                            }
                        }

                        stateElementChangeSubscriptions[stateElementId] = event['bind'](
                            'change',
                            stateElement,
                            stateChangeHandler
                        )
                    }
                }

                if (initialStateValueSelectedDict) {
                    updateMultiState(initialStateValueSelectedDict);
                    initialStateValueSelectedDict = null;
                }

                has_initialized = true;
            };
        // endregion
        // endregion

        initialize();

        popstateSubscription = event['bind'](POP_STATE, window, genericStateChangeHandler);
        hashchangeSubscription = event['bind'](HASH_CHANGE, window, genericStateChangeHandler);

        __ret = {
            'initialize': initialize,
            'events': {},
            'getCurrentState': function () {
                return stateValueSelectedDict;
            },
            'serializeState': serializeState,
            'deserializeState': deserializeState
        };
        __ret['events'][statePopEvent['getEventName']()] = statePopEvent;
        return __ret;
    }
);
