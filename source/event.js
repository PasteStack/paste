/*jslint white:false plusplus:false browser:true nomen:false sub:true */
/*globals paste */

/**
 * The paste.js eventing module. This is provides support for object oriented event management
 *
 * @compilation_level ADVANCED_OPTIMIZATIONS
 *
 * @requires paste
 * @requires paste/guid
 * @requires paste/util
 * @module paste/event
 */
paste['define']('paste.event', ['paste.guid', 'paste.util'], function (event, guid, util) {
    'use strict';

    var IE_EVENTS = {
            'blur' : null,
            'change' : null,
            'click' : null,
            'contextmenu' : null,
            'copy' : null,
            'cut' : null,
            'dblclick' : null,
            'error' : null,
            'focus' : null,
            'focusin' : null,
            'focusout' : null,
            'hashchange' : null,
            'keydown' : null,
            'keypress' : null,
            'keyup' : null,
            'load' : null,
            'mousedown' : null,
            'mouseenter' : null,
            'mouseleave' : null,
            'mousemove' : null,
            'mouseout' : null,
            'mouseover' : null,
            'mouseup' : null,
            'mousewheel' : null,
            'paste' : null,
            'reset' : null,
            'resize' : null,
            'scroll' : null,
            'select' : null,
            'submit' : null,
            'textinput' : null,
            'unload' : null,
            'wheel' : null
        },

        getEventTarget = function (e) {
            var element = null;
            if (e.target) {
                element = e.target;
            } else if (e.srcElement) {
                element = e.srcElement;
            }
            return element;
        },

    // linkages
        $createGuid = guid['Guid']['create'],
        $isString = util['isString'],
        $isEmptyString = util['isEmptyString'],
        $hasMethod = util['hasMethod'],
        $parseBoolean = util['parseBoolean'],
        $addEventListenerSupport = window.addEventListener ? true : false,

        createEventSupport = document.createEvent ? true : false,
        createEventObjectSupport = document.createEventObject ? true : false,
        moduleGuid = $createGuid();

    /**
     *
     * @param $arguments
     * @constructor
     */
    function PasteEventData($arguments) {
        if ($arguments && $arguments.length === 1) {
            $arguments = $arguments[0];
        }

        this.idemId = $createGuid();
        this['data'] = $arguments;
    }

    /**
     *
     * @param defaultContext
     * @param eventName
     * @param bubbles
     * @param cancelable
     * @constructor
     */
    function PasteEvent(defaultContext, eventName, bubbles, cancelable) {
        this.eventName = ($isString(eventName) && $isEmptyString(eventName) === false) ? eventName : ('$pasteEvent-' + $createGuid());

        if (defaultContext && defaultContext['nodeType']) {
            this.dispatchContext = defaultContext;
        } else if (createEventSupport) {
            this.dispatchContext = document;
        } else {
            this.dispatchContext = document.documentElement;
        }

        this.defaultContext = defaultContext || window;

        this.subscriptions = {};

        if (createEventSupport) {
            this.eventProxy = document.createEvent('Event');
            this.eventProxy.initEvent(this.eventName, $parseBoolean(bubbles), $parseBoolean(cancelable, true));
            this.eventProxy['pasteEvent'] = new PasteEventData(null);
        } else if (createEventObjectSupport) {
            this.eventProxy = document.createEventObject();
            this.eventProxy['pasteEvent'] = new PasteEventData(null);
        } else {
            throw (new Error('Fatal event error'));
        }
    }

    /**
     *
     * @param eventName
     * @param element_or_eventContext
     * @param method
     * @param context
     * @param executeCount
     * @constructor
     */
    function PasteSubscription(eventName, element_or_eventContext, method, context, executeCount) {
        var guid = $createGuid(),
            $ieEventName,
            $ieListenerHandler;

        if ($isString(method) && context) {
            method = context[method];
        }

        if (executeCount === true) {
            executeCount = 1;
        }

        if ((element_or_eventContext && element_or_eventContext['nodeType']) || element_or_eventContext === window) {
            this.eventContext = element_or_eventContext;
        } else {
            this.eventContext = ((createEventSupport) ? document : document.documentElement);
        }

        this.guid = guid;

        if ($hasMethod(eventName, 'getEventName')) {
            this.eventName = eventName['getEventName']();
            this.eventUnsubscribe = (function ($pasteEvent, guid) {
                return function ($removeFunc) {
                    if ($removeFunc && $removeFunc === $pasteEvent['remove']) {
                        return;
                    }
                    $pasteEvent['remove'](guid);
                };
            }(eventName, guid));
        } else {
            this.eventName = eventName;
            this.eventUnsubscribe = function () {
            };
        }

        this.pasteEventIdem = '';
        this.method = method;
        this.context = context;
        this.executeCount = executeCount || 0;
        this._isBound = true;
        this.listenerHandler = (function ($this) {
            return function ($domEvent) {
                var remove = ($this.executeCount -= 1) === 0,
                    idemId,
                    eventArg,
                    $pasteEvent,
                    $pasteEventData,
                    element;

                if ($this._isBound === false) {
                    return;
                }

                eventArg = $domEvent;

                if (!eventArg) {
                    eventArg = window.event;
                }

                if (remove) {
                    $this._isBound = false;
                }

                // stupid IE <= 8 hack
                if (!eventArg.preventDefault) {
                    eventArg.preventDefault = function () {
                        eventArg.returnValue = false;
                    };
                }

                // stupid IE <= 8 hack
                if (!eventArg.stopPropagation) {
                    eventArg.stopPropagation = function () {
                        eventArg.cancelBubble = false;
                    };
                }

                // stupid IE <= 8 hack
                if (!eventArg.target) {
                    eventArg.target = eventArg.srcElement;
                }

                // stupid IE <= 8 hack
                if (!eventArg.currentTarget) {
                    eventArg.currentTarget = eventArg.srcElement;
                }

                $pasteEvent = eventArg['pasteEvent'] || null;

                if ($pasteEvent) {
                    idemId = $pasteEvent.idemId;
                    $pasteEventData = $pasteEvent['data'];
                    if ($this.pasteEventIdem === idemId) {
                        $pasteEventData = null;
                    } else {
                        $this.pasteEventIdem = idemId;
                    }
                }
                if ($this.context) {
                    $this.method.call($this.context, eventArg, $pasteEventData);
                } else {
                    $this.method(eventArg, $pasteEventData);
                }

                if (remove) {
                    $this['remove']();
                }
            };
        }(this));

        if ($addEventListenerSupport) {
            this.eventContext.addEventListener(this.eventName, this.listenerHandler, false);
        } else if (window.attachEvent) {
//            console.log('Subscribing: ' + this.eventName)
            if ($hasMethod(eventName, 'getEventName')) {
//                console.log('event wrapper sub');
                $ieEventName = eventName.getEventName();
                $ieListenerHandler = util['cloneFunction'](this.listenerHandler);
                delete this.listenerHandler;

                this.listenerHandler = (function ($this, $eventName) {
                    return function (e) {
                        var eventName = e.type,
                            canFireHandler = false;

//                        console.log('handler for: ' + $eventName + '; type=' + eventName + '; propName=' + e.propertyName)
                        if ($eventName === eventName) {
                            canFireHandler = true;
//                            console.log('REGULAR DOM EVENT TRIGGERED')
                        } else if ($eventName === e.propertyName && $eventName + '$pasteEvent' in e.srcElement) {
                            e['pasteEvent'] = e.srcElement[$eventName + '$pasteEvent'];
                            canFireHandler = true;
//                            console.log('CUSTOM EVENT TRIGGERED')
                        }

                        if (canFireHandler) {
//                            console.log('firing handler')
                            $ieListenerHandler.apply($this, arguments);
                        }
                    };
                }(this, $ieEventName));

                if (IE_EVENTS.hasOwnProperty($ieEventName)) {
                    this.eventName = 'on' + $ieEventName;
                    this.eventContext.attachEvent(this.eventName, this.listenerHandler);
                }
//                console.log(this.eventContext);
                this.eventContext[guid + '$eventName'] = 'onpropertychange';
                this.eventContext.attachEvent(this.eventContext[guid + '$eventName'], this.listenerHandler);

//                console.log('end event wrap sub');
            } else {
//                console.log('regular sub');
                this.eventName = 'on' + eventName;
                this.eventContext.attachEvent(this.eventName, this.listenerHandler);
            }
        }
    }

    PasteSubscription.prototype._removeEventListener = function () {
        if ($addEventListenerSupport) { /*ignore-this-jslint-error*/
            this.eventContext.removeEventListener(this.eventName, this.listenerHandler, false);
        } else if (window.attachEvent) {
            var eventPropertyName = this.guid + '$eventName';
            if (this.eventContext[eventPropertyName]) {
//                    console.log('detaching (' + this.guid + '$eventName): ' + this.eventContext[eventPropertyName]);
                this.eventContext.detachEvent(this.eventContext[eventPropertyName], this.listenerHandler);
                delete this.eventContext[eventPropertyName];
            }
            this.eventContext.detachEvent(this.eventName, this.listenerHandler);
        }
    };

    PasteSubscription.prototype['getGuid'] = function () {
        return this.guid;
    };
    PasteSubscription.prototype['remove'] = function ($removeFunc) {
        this._removeEventListener();
        this.eventUnsubscribe($removeFunc);

        delete this.listenerHandler;
        delete this.eventName;
        delete this.method;
        delete this.context;
        delete this.executeCount;
        delete this._isBound;
    };
    PasteSubscription.prototype['dispose'] = PasteSubscription.prototype['remove'];
    PasteSubscription.prototype['attach'] = function () {
        if (this._isBound) {
            return false;
        }

        this._isBound = true;
        return true;
    };
    PasteSubscription.prototype['detach'] = function () {
        if (!this._isBound) {
            return false;
        }

        this._isBound = false;
        return true;
    };
    PasteSubscription.prototype['isBound'] = function () {
        return this._isBound;
    };
    PasteEvent.prototype['getEventName'] = function () {
        return this.eventName;
    };
    PasteEvent.prototype['remove'] = function (subscription_or_guid) {
        if ($hasMethod(subscription_or_guid, 'getGuid')) {
            var guid = subscription_or_guid['getGuid']();
            subscription_or_guid['remove'](this['remove']);
            delete this.subscriptions[guid];
        } else if ($isString(subscription_or_guid)) {
            this.subscriptions[subscription_or_guid]['remove'](this['remove']);
            delete this.subscriptions[subscription_or_guid];
        }
    };
    PasteEvent.prototype['fire'] = function () {
        if (createEventSupport) {
            this.eventProxy['pasteEvent'] = new PasteEventData(arguments || null);
            this.dispatchContext.dispatchEvent(this.eventProxy);
        } else if (createEventObjectSupport) {
            var eventName = this.eventName,
                dispatchContext;

//            console.log('calling ev fire: ' + this.eventName);
            try {
                this.eventProxy['pasteEvent'] = new PasteEventData(arguments || null);
                this.defaultContext['fireEvent']('on' + eventName, this.eventProxy);
            } catch (e) {
//                console.log('failed ev fire: ' + eventName);
//                console.log(this.dispatchContext)
                this.dispatchContext[eventName + '$pasteEvent'] = new PasteEventData(arguments || null);
                dispatchContext = this.dispatchContext[eventName];
                if (dispatchContext) {
//                    console.log('failed increment')
                    this.dispatchContext[eventName] += 1;
                } else {
//                    console.log('failed create')
                    this.dispatchContext[eventName] = 1;
                }

//                console.log(this.dispatchContext[eventName])
            }
//            console.log('completed ev fire: ' + eventName);
            eventName = null;
        }
    };
    PasteEvent.prototype['subscribe'] = function (method, context, executeCount) {
        var subscription = new PasteSubscription(this, this.dispatchContext, method, context || this.defaultContext, executeCount),
            subscriptionGuid = subscription['getGuid']();
        this.subscriptions[subscriptionGuid] = subscription;
        return this.subscriptions[subscriptionGuid];
    };
    PasteEvent.prototype['bind'] = PasteEvent.prototype['subscribe'];
    PasteEvent.prototype['dispose'] = function () {
        var keys = Object.keys(this.subscriptions),
            i,
            len = keys.length;
        for (i = 0; i < len; i += 1) {
            this['remove'](keys[i]);
        }

        delete this.eventProxy;
        delete this.dispatchContext;
        delete this.defaultContext;
        delete this.subscriptions;
        delete this.eventName;
        delete this.eventProxy;
    };

    event['bind'] = function (eventName, element_or_eventContext, method, context, executeCount) {
        return new PasteSubscription(eventName, element_or_eventContext, method, context, executeCount);
    };
    event['getEventTarget'] = getEventTarget;
    event['DocumentEvent'] = {
        'loaded' : function (method, context, executeCount) {
            if (!window[moduleGuid + '$pasteEvent$onLoad']) {
                window[moduleGuid + '$pasteEvent$onLoad'] = new PasteEvent();
                if (document.readyState.toLowerCase() === 'loaded' || document.readyState.toLowerCase() === 'complete') {
                    var timeout = window.setTimeout(function () {
                        window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                        window.clearTimeout(timeout);
                        timeout = null;
                    }, 0);
                } else if (!document.addEventListener && document.attachEvent) {
                    if (document.readyState) {
                        document.attachEvent('onreadystatechange', function () {
                            if (document.readyState.toLowerCase() === 'loaded' || document.readyState.toLowerCase() === 'complete') {
                                window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                            }
                        });
                    } else {
                        document.attachEvent('onload', function () {
                            window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                        });
                    }
                } else if (document.addEventListener) {
                    window.addEventListener('load', function () {
                        window[moduleGuid + '$pasteEvent$onLoad']['fire']();
                    });
                }
            }
            return window[moduleGuid + '$pasteEvent$onLoad']['subscribe'](method, context, executeCount);
        }
    };
    event['Event'] = PasteEvent;
    event['Event']['getEventTarget'] = getEventTarget;
    event['Event']['Subscription'] = event['Subscription'] = PasteSubscription;
});