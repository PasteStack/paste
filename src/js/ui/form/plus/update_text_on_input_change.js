/**
 * @requires paste/dom
 * @requires paste/event
 * @requires paste/util
 * @requires paste/guid
 * @module paste/ui/form/plus/update_text_on_input_change
 */

paste.define(
    'paste.ui.form.plus.update_text_on_input_change',
    [
        'paste.dom',
        'paste.event',
        'paste.util',
        'paste.guid'
    ],
    function (module, dom, event, util, guid, undefined) {
        'use strict';

        var UPDATE_VARIABLE_NAME_DATA_ATTR = 'data-update-variable-name',
            UPDATE_VARIABLE_NAMES_DATA_ATTR = 'data-update-variable-names',
            UPDATE_DEFAULT_VALUE_DATA_ATTR = 'data-update-variable-default',
            ORIGINAL_VALUE_DATA_ATTR = 'data-original-value',
            variableElements = [],
            outputElements = [],
            lastValues = {},
            values = {},
            defaultValues = {},
            setVariable,
            updateOutputs,
            updateOutput,
            findElements,
            init,
            inputUpdateHandler,
            changeSubscriptions = {},
            focusOutSubscriptions = {},
            keyUpSubscriptions = {};

        setVariable = function(variableName, value) {
            values[variableName] = value;
        };

        inputUpdateHandler = function(e) {
            var $el = event['getEventTarget'](e),
                $radios,
                value,
                variableName = $el['getAttribute'](UPDATE_VARIABLE_NAME_DATA_ATTR),
                type = $el['type']['toUpperCase'](),
                tagName = $el['tagName']['toUpperCase']();

            if( tagName == 'INPUT' ) {
                if( type == 'CHECKBOX' ) {
                    value = $el['checked'] ? $el['value'] : undefined;
                }
                else if( type == 'RADIO' ) {
                    $radios = dom['querySelectorAll']('input[type=radio][name='+$el['name']+']:checked');
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

            if(typeof value !== 'undefined') {
                setVariable(variableName, value);
            }

            updateOutputs();                    
        };

        updateOutput = function($el) {
            var newText = $el['getAttribute'](ORIGINAL_VALUE_DATA_ATTR);

            util['each']($el['getAttribute'](UPDATE_VARIABLE_NAMES_DATA_ATTR)['split'](','),function(variableName) {
                newText = newText['split']('%('+variableName+')s')['join'](values[variableName] || defaultValues[variableName] || "??");
            });

            $el['innerHTML'] = newText;
        };

        updateOutputs = function(force) {
            var variableName, $el;

            if(!force) {
                force = false;
                for(variableName in values) {
                    if(values['hasOwnProperty'](variableName)) {
                        if(values[variableName]!=lastValues[variableName]) {
                            force = true;
                            break;
                        }
                    }
                }
            }

            if(force) {
                util['each'](outputElements,function(id){
                    updateOutput(document['getElementById'](id));
                });
                for(variableName in values) {
                    if(values['hasOwnProperty'](variableName)) {
                        lastValues[variableName] = values[variableName];
                    }
                }
            }
        };

        findElements = function($parent,dataAttr,elementList,callback) {
            util['each'](dom['querySelectorAll']("*["+dataAttr+"]", $parent),function($el){
                var id = $el['id'] || guid['Guid']['create']();

                if( !$el['id'] ) {
                    $el['id'] = id;
                }
                if( elementList['indexOf'](id) == -1 ) {
                    elementList['push'](id);
                }
                if(callback && callback['call']) {
                    callback($el, id);
                }
            });

        };

        init = function($parent) {
            $parent = $parent || document;

            findElements($parent,UPDATE_VARIABLE_NAME_DATA_ATTR,variableElements,function($el,id){
                var variableName = $el['getAttribute'](UPDATE_VARIABLE_NAME_DATA_ATTR),
                    defaultValue = $el['getAttribute'](UPDATE_DEFAULT_VALUE_DATA_ATTR);

                if(typeof defaultValue !== 'undefined') {
                    defaultValues[variableName] = defaultValue;
                }

                if (!changeSubscriptions[id]) {
                    changeSubscriptions[id] = event['bind']('change', $el, inputUpdateHandler);
                }

                if (!focusOutSubscriptions[id]) {
                    focusOutSubscriptions[id] = event['bind']('focusout', $el, inputUpdateHandler);
                }

                if (!keyUpSubscriptions[id]) {
                    keyUpSubscriptions[id] = event['bind']('keyup', $el, inputUpdateHandler);
                }
            });

            findElements($parent,UPDATE_VARIABLE_NAMES_DATA_ATTR,outputElements,function($el){
                if( !$el['getAttribute'](ORIGINAL_VALUE_DATA_ATTR) ) {
                    $el['setAttribute'](ORIGINAL_VALUE_DATA_ATTR,$el['innerHTML']);
                }
            });

            updateOutputs(true);
        };

        init();

        module['init'] = init;
        module['updateOutputs'] = updateOutputs;
        module['setVariable'] = setVariable;
    }
);
