/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * Polyfill Module
 *
 * @requires paste
 * @module polyfills/focusinout
 *
 */

paste.define('polyfills.focusinout', function () {
    /*
     *emulate focusin and focusout in FF
     * Note this is for current FF (12.0)
     */

    if (window.attachEvent) {
        return;
    }

    var needsFocusPolyfill = true,
        _formNodeNames = {
            'input' : 'input',
            'select' : 'select',
            'textarea' : 'textarea'
        },
        _eventTypeMap = {
            'blur' : 'focusout',
            'focus' : 'focusin'
        },
        _delegateEvent = function (event) {
            var element = null;
            if (event.target) {
                element = event.target;
            } else if (event.srcElement) {
                element = event.srcElement;
            }

            if (!element || !_formNodeNames.hasOwnProperty(element.nodeName.toLowerCase()) || !_eventTypeMap.hasOwnProperty(event.type.toLowerCase())) {
                return;
            }

            _fireEvent(element, _eventTypeMap[event.type.toLowerCase()]);
        },
        _eventTrigger, _focusTestSuccess = function (e) {
            needsFocusPolyfill = false;
        },
        _endFocusTest = function (e) {
            // todo - look into adding a hack to go to scroll pos on end
            input.removeEventListener('focusin', _focusTestSuccess, true);
            input.removeEventListener('change', _endFocusTest, true);

            var element = e.target || e.srcElement;
            element.parentNode.removeChild(element);

            if (needsFocusPolyfill) {
                _createFocusPolyfill();
            }
        },
        _fireEvent = function (element, event) {
            if (document.createEventObject) {
                _eventTrigger = document.createEventObject();
                return element.fireEvent('on' + event, _eventTrigger);
            }
            else {
                // dispatch for firefox + others
                _eventTrigger = document.createEvent("HTMLEvents");
                _eventTrigger.initEvent(event, true, true);
                return !element.dispatchEvent(_eventTrigger);
            }
        },
        _createFocusPolyfill = function () {
            document.addEventListener("focus", _delegateEvent, true);
            document.addEventListener("blur", _delegateEvent, true);
        },
        frag = document.createDocumentFragment(),
        input = document.createElement("input");
    frag.appendChild(input);
    input.style.position = "absolute";
    input.style.height = '1px';
    input.style.width = '1px';
    input.style.border = '0';
    input.style.outline = '0';
    input.style.margin = '0';
    input.style.padding = '0';
    document.head.appendChild(frag);


    input.addEventListener('focusin', _focusTestSuccess, true);
    input.addEventListener('change', _endFocusTest, true);

    input.focus();
    _fireEvent(input, 'change');
});