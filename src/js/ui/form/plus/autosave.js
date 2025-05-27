/**
 * @requires paste/dom
 * @requires paste/event
 * @requires paste/util
 * @requires paste/io
 * @requires paste/guid
 * @module paste/ui/form/plus/autosave
 */

paste.define(
    'paste.ui.form.plus.autosave',
    [
        'paste.dom',
        'paste.event',
        'paste.util',
        'paste.io',
        'paste.guid'
    ],
    function (autosave_module, dom, event, util, io, guid, undefined) {
        'use strict';

        var AUTOSAVE_DATA_ATTR = "data-ui-autosave",
            AUTOSAVE_ACTION_DATA_ATTR = "data-autosave-action",
            UPDATE_ATTR_DATA_ATTR = "data-update-attribute",  // e.g.: "attrName=varFromServer,attrName2=varFromServer2"
            UPDATE_CONTENTS_DATA_ATTR = "data-update-contents",  // e.g.: "moduleName"
            UPDATE_FORM_ID_DATA_ATTR = "data-autosave-form-id",
            NOT_AUTOSAVED_CLASS = "not-autosaved",
            NOT_AUTOSAVING_CLASS = "not-autosaving",
            AUTOSAVING_CLASS = "autosaving",
            TIMER_PERIOD_IN_MS = 10000,
            FORM_STATE_FIRST_RUN = 0,
            FORM_STATE_IDLE = 1,
            FORM_STATE_CHANGED = 2,
            FORM_STATE_SAVING = 3,
            FORM_STATE_PENDING_SAVE = 4,
            TRANSITION_KEYUP = 0,
            TRANSITION_CHANGE = 1,
            TRANSITION_TIMER_UP = 2,
            TRANSITION_BEFORE_UNLOAD = 3,
            TRANSITION_BLUR = 4,
            TRANSITION_NO_DIFFERENCE = 5,
            TRANSITION_XHR_COMPLETE = 6,
            TRANSITION_SECOND_XHR_REQUEST = 7,
            STATE_TRANSITION_DIAGRAM = {},
            autosaveForms = [],
            monitoredInputs = {},
            updateAttributes = [],
            updateInnerHtml = [],
            blurKeyupTags = ['INPUT','TEXTAREA'],
            changeSubscriptions = {},
            keyupSubscriptions = {},
            blurSubscriptions = {},
            beforeunloadSubscriptions = [],
            formStatuses = {},
            timers = {},
            lastPseudoSerialData = {},
            init,
            getAndSetId,
            transition,
            startTimer,
            stopTimer,
            attemptUpdate,
            getElementById = document['getElementById'],
            addAutoSavingClass,
            removeAutoSavingClass,
            onXhrComplete,
            updateModules,
            updateVariables,
            elementValue,
            pseudoSerialize,
            xhr_count = {};

        STATE_TRANSITION_DIAGRAM[FORM_STATE_FIRST_RUN] = {};
        STATE_TRANSITION_DIAGRAM[FORM_STATE_IDLE] = {};
        STATE_TRANSITION_DIAGRAM[FORM_STATE_CHANGED] = {};
        STATE_TRANSITION_DIAGRAM[FORM_STATE_SAVING] = {};

        STATE_TRANSITION_DIAGRAM[FORM_STATE_FIRST_RUN][TRANSITION_KEYUP] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_FIRST_RUN][TRANSITION_CHANGE] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_FIRST_RUN][TRANSITION_BLUR] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_FIRST_RUN][TRANSITION_NO_DIFFERENCE] = FORM_STATE_IDLE;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_FIRST_RUN][TRANSITION_XHR_COMPLETE] = FORM_STATE_SAVING;

        STATE_TRANSITION_DIAGRAM[FORM_STATE_IDLE][TRANSITION_KEYUP] = FORM_STATE_CHANGED;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_IDLE][TRANSITION_CHANGE] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_IDLE][TRANSITION_BLUR] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_IDLE][TRANSITION_XHR_COMPLETE] = FORM_STATE_SAVING;

        STATE_TRANSITION_DIAGRAM[FORM_STATE_CHANGED][TRANSITION_TIMER_UP] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_CHANGED][TRANSITION_BEFORE_UNLOAD] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_CHANGED][TRANSITION_BLUR] = FORM_STATE_SAVING;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_CHANGED][TRANSITION_NO_DIFFERENCE] = FORM_STATE_IDLE;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_CHANGED][TRANSITION_XHR_COMPLETE] = FORM_STATE_SAVING;

        STATE_TRANSITION_DIAGRAM[FORM_STATE_SAVING][TRANSITION_NO_DIFFERENCE] = FORM_STATE_IDLE;
        STATE_TRANSITION_DIAGRAM[FORM_STATE_SAVING][TRANSITION_XHR_COMPLETE] = FORM_STATE_CHANGED;

        elementValue = function($el, $form) {
            var $radios,
                value,
                type = $el['type']['toUpperCase'](),
                tagName = $el['tagName']['toUpperCase']();

            if( tagName == 'INPUT' ) {
                if( type == 'CHECKBOX' ) {
                    value = $el['checked'] ? $el['value'] : undefined;
                }
                else if( type == 'RADIO' ) {
                    $radios = dom['querySelectorAll']('input[type=radio][name="'+$el['name']+'"]:checked', $form);
                    if($radios['length'] == 1) {
                        value = $radios[0]['value'];
                    }
                }
                else {
                    value = $el['value'];
                }
            }
            else {
                value = $el['value'];
            }

            return value;
        };

        pseudoSerialize = function(formId, $form){
            var outputArray = [];

            $form = $form || document.getElementById(formId);

            util['each'](monitoredInputs[formId], function(elId) {
                var $el = document.getElementById(elId);
                if($el && $el['name']) {
                    outputArray['push']($el['name'] + "=" + elementValue($el,$form));
                }
            });

            return outputArray.join(",");
        };

        addAutoSavingClass = function(formId) {
            var $form = document.getElementById(formId);
            if($form) {
                dom['addCssClass']($form, AUTOSAVING_CLASS);
                dom['removeCssClass']($form, NOT_AUTOSAVING_CLASS);
            }
        };

        removeAutoSavingClass = function(formId) {
            var $form = document.getElementById(formId);
            if($form) {
                dom['removeCssClass']($form, AUTOSAVING_CLASS);
                dom['addCssClass']($form, NOT_AUTOSAVING_CLASS);
            }
        };

        startTimer = function(formId) {
            if(typeof timers[formId] === "undefined") {
                timers[formId] = window['setTimeout'](function() {
                    transition(formId, TRANSITION_TIMER_UP);
                }, TIMER_PERIOD_IN_MS)
            }
        };

        stopTimer = function(formId) {
            if(typeof timers[formId] !== "undefined") {
                window['clearTimeout'](timers[formId]);
                delete timers[formId];
            }
        };

        onXhrComplete = function(formId) {
            xhr_count[formId] = false;
            transition(formId, TRANSITION_XHR_COMPLETE);
        };

        updateModules = function(modules) {
            var moduleName;

            for(moduleName in modules) {
                if(modules['hasOwnProperty'](moduleName)) {
                    util['each'](updateInnerHtml, function(elId) {
                        var $el = document.getElementById(elId);

                        if($el && $el['getAttribute'](UPDATE_CONTENTS_DATA_ATTR) == moduleName) {
                            $el['innerHTML'] = modules[moduleName]['markup'];
                        }
                    });
                }
            }
        };

        updateVariables = function(variables) {
            var variableName;

            for(variableName in variables) {
                if(variables['hasOwnProperty'](variableName)) {
                    util['each'](updateAttributes, function(elId) {
                        var $el = document.getElementById(elId);

                        if($el && $el['getAttribute'](UPDATE_ATTR_DATA_ATTR)['indexOf']("="+variableName) !== -1) {
                            util['each']($el['getAttribute'](UPDATE_ATTR_DATA_ATTR)['split'](','), function(attribute_variable_pair_string) {
                                var attribute_variable_pair_array = attribute_variable_pair_string.split("=");
                                if(attribute_variable_pair_array['length'] == 2 && attribute_variable_pair_array[1] === variableName) {
                                    $el['setAttribute'](attribute_variable_pair_array[0], variables[variableName]);
                                }
                            });
                        }
                    });
                }
            }
        };

        attemptUpdate = function(formId, async) {
            var differences = false,
                $form = document.getElementById(formId),
                url,
                data,
                pseudoSerialData;

            pseudoSerialData = pseudoSerialize(formId, $form);

            if(xhr_count[formId] || !async) {
                transition(formId, TRANSITION_SECOND_XHR_REQUEST);
            }
            else if(lastPseudoSerialData[formId] == pseudoSerialData) {
                transition(formId, TRANSITION_NO_DIFFERENCE);
            }
            else if($form) {
                data = new FormData($form);
                url = $form['getAttribute'](AUTOSAVE_ACTION_DATA_ATTR);

                xhr_count[formId] = true;
                io['post'](url, data, function(response, status, request){
                    if(status == 200 && response['data'] && response['meta'] && response['meta']['code'] == 200) {
                        lastPseudoSerialData[formId] = pseudoSerialData;
                        updateModules(response['data']['modules']);
                        updateVariables(response['data']['variables']);
                        dom['removeCssClass']($form, NOT_AUTOSAVED_CLASS);
                    }
                    onXhrComplete(formId);
                }, function() {
                    onXhrComplete(formId);
                }, this, async);
            }
        };

        transition = function(formId, nextTransition) {
            var currentState = formStatuses[formId] || FORM_STATE_FIRST_RUN,
                allowedTransitions = STATE_TRANSITION_DIAGRAM[currentState] || {},
                nextState = allowedTransitions[nextTransition];

            if(typeof nextState !== "undefined") {
                formStatuses[formId] = nextState;

                if(nextState == FORM_STATE_CHANGED) {
                    startTimer(formId);
                }
                else if(nextState == FORM_STATE_SAVING) {
                    stopTimer(formId);
                    addAutoSavingClass(formId);
                    attemptUpdate(formId, nextTransition!=TRANSITION_BEFORE_UNLOAD);
                }
                else if(nextState == FORM_STATE_IDLE) {
                    removeAutoSavingClass(formId);
                }
            }
        };

        getAndSetId = function($el) {
            var id = $el['id'] || guid['Guid']['create']();

            if( !$el['id'] ) {
                $el['id'] = id;
            }

            return id;
        };

        init = function($parent) {
            var atLeastOneForm = false;
            $parent = $parent || document;

            util['each'](dom['querySelectorAll']('form['+AUTOSAVE_DATA_ATTR+']', $parent), function($form) {
                var formId;

                if(!$form['getAttribute'](AUTOSAVE_ACTION_DATA_ATTR)) {
                    return;
                }

                formId = getAndSetId($form);
                atLeastOneForm = true;

                autosaveForms.push(formId);

                monitoredInputs[formId] = [];

                removeAutoSavingClass(formId);

                if($form['getAttribute'](AUTOSAVE_ACTION_DATA_ATTR) == $form['getAttribute']('action')) {
                    dom['addCssClass']($form, NOT_AUTOSAVED_CLASS);
                }

                if(!changeSubscriptions[formId]) {
                    changeSubscriptions[formId] = event['bind']('change', $form, function() {
                        transition(formId, TRANSITION_CHANGE);
                    });
                }

                util['each']($form['getAttribute'](AUTOSAVE_DATA_ATTR).split(','), function(inputName) {
                    util['each'](dom['querySelectorAll']('*[name="'+inputName+'"]', $form), function($input) {
                        var inputId = getAndSetId($input);

                        $input['setAttribute'](UPDATE_FORM_ID_DATA_ATTR, formId);
                        monitoredInputs[formId]['push'](inputId);

                        if(blurKeyupTags.indexOf($input.tagName.toUpperCase()) != -1) {
                            if(!keyupSubscriptions[inputId]) {
                                keyupSubscriptions[inputId] = event['bind']('keyup', $input, function() {
                                    transition(formId, TRANSITION_KEYUP);
                                });
                            }
                            if(!blurSubscriptions[inputId]) {
                                blurSubscriptions[inputId] = event['bind']('blur', $input, function() {
                                    transition(formId, TRANSITION_BLUR);
                                });
                            }
                        }
                    });
                });

                lastPseudoSerialData[formId] = pseudoSerialize(formId, $form);

                util['each'](dom['querySelectorAll']('*['+UPDATE_ATTR_DATA_ATTR+']'), function($el) {
                    updateAttributes['push'](getAndSetId($el));
                });

                util['each'](dom['querySelectorAll']('*['+UPDATE_CONTENTS_DATA_ATTR+']'), function($el) {
                    updateInnerHtml['push'](getAndSetId($el));
                });
            });

            if(atLeastOneForm && beforeunloadSubscriptions.length == 0) {
                beforeunloadSubscriptions['push'](event['bind']('beforeunload', window, function() {
                    util['each'](autosaveForms, function(formId) {
                        transition(formId, TRANSITION_BEFORE_UNLOAD);
                    });
                }));
            }
        };

        autosave_module['init'] = init;

        init();
    }
);
