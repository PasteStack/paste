/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * Polyfill Module
 *
 * @requires paste
 * @requires paste/event
 * @requires paste/dom
 * @module paste/ui/form/validity
 *
 */

paste.define(
    'paste.ui.form.validity',
    [
        'paste.event',
        'paste.dom'
    ],
    function (module, event, dom) {
        /*
         * Emulate validity for some browsers
         * http://dev.w3.org/html5/spec/constraints.html#validitystate
         */

        if ('validity' in document.createElement('input')) {
            return function (el) {
            }; // no op
        }

        var fireInvalidEvent = function fireInvalidEvent(element) {
                var invalidEvent = new event['Event'](
                    element,
                    'invalid',
                    true,
                    true
                );
                invalidEvent['fire']();
                invalidEvent['dispose']();
                invalidEvent = null;
            },
            parseBoolean = function (value, defaultValue) {
                var parse = function (val) {
                        if (typeof(val) === 'boolean' || (val !== null && typeof(val) === 'object' && val instanceof Boolean)) {
                            return val;
                        } else if (typeof(val) === 'string' || (val !== null && typeof(val) === 'object' && val instanceof String)) {
                            return val.toLowerCase() === 'true';
                        } else {
                            return null;
                        }
                    },
                    __ret = parse(value),
                    __defaultRet = parse(defaultValue);
                if (__ret !== null) {
                    return __ret;
                } else if (__defaultRet !== null) {
                    return __defaultRet;
                } else {
                    return false;
                }
            }, html5InputPatterns = {
                datetime: /^\s*\S/, // whitespace check for now
                'datetime-local': /^\s*\S/, // whitespace check for now
                date: /\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}/,
                month: /^\s*\S/, // whitespace check for now
                time: /^\s*\S/, // whitespace check for now
                week: /^\s*\S/, // whitespace check for now
                number: /-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?/,
                range: /^\s*\S/, // whitespace check for now
                email: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                url: /\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i, // whitespace check for now
                search: /^\s*\S/, // whitespace check for now
                tel: /^\s*\S/, // whitespace check for now
                color: /^\s*\S/, // whitespace check for now
                file: /^(?:[\w]\:|\\)(\\[A-Za-z_\-\s0-9\.]+)+\.(png|jpg|jpeg)$/ //check for correct image type
            },
            $math = Math,
            $rand = $math['random'],
            S4 = function S4() {
                return (((1 + $rand()) * 0x10000) | 0)['toString'](16)['substring'](1);
            },
            bootstrappedKey = 'validityBootstrapped' + (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4()),
            bootstrap = function bootstrap(el) {
                if ('validity' in el || el[bootstrappedKey]) {
                    return;
                }


                if (el.nodeType === Node.ELEMENT_NODE && el.nodeName.toLowerCase() === 'form') {
                    if (el['checkValidity']) {
                        return;
                    }
                    el['checkValidity'] = (function ($el) {
                        return function () {
                            var formElements = dom['querySelectorAll'](
                                    'button,input,select,textarea',
                                    $el
                                ),
                                formElementsLen = formElements['length'],
                                isValid = true;

                            while (formElementsLen --) {
                                bootstrap(formElements[formElementsLen]);
                                if (!formElements[formElementsLen]['checkValidity']()) {
                                    isValid = false;
                                    break;
                                }
                            }

                            return isValid;
                        };
                    }(el));
                } else if (el.nodeType === Node.ELEMENT_NODE) {

                    // todo: support custom patterns
                    /*
                     input type=datetime – global date-and-time input control NEW
                     input type=datetime-local – local date-and-time input control NEW
                     input type=date – date input control NEW
                     input type=month – year-and-month input control NEW
                     input type=time – time input control NEW
                     input type=week – year-and-week input control NEW
                     input type=number – number input control NEW
                     input type=range – imprecise number-input control NEW
                     input type=email – e-mail address input control NEW
                     input type=url – URL input control NEW
                     input type=search – search field NEW
                     input type=tel – telephone-number-input field NEW
                     input type=color – color-well control NEW
                     */

                    // do check here
                    if (!el['validity']) {
                        el['validity'] = new window['ValidityState']();
                    }
                    if (el['checkValidity']) {
                        return;
                    }
                    el['checkValidity'] = (function ($el) {
                        return function () {
                            /*
                             Suffering from being missing
                             When a control has no value but has a required attribute (input required, select required, textarea required), or, in the case of an element in a radio button group, any of the other elements in the group has a required attribute.

                             Suffering from a type mismatch
                             When a control that allows arbitrary user input has a value that is not in the correct syntax (E-mail, URL).

                             Suffering from a pattern mismatch
                             When a control has a value that doesn't satisfy the pattern attribute.

                             Suffering from being too long
                             When a control has a value that is too long for the form control maxlength attribute (input maxlength, textarea maxlength).

                             Suffering from an underflow
                             When a control has a value that is too low for the min attribute.

                             Suffering from an overflow
                             When a control has a value that is too high for the max attribute.

                             Suffering from a step mismatch
                             When a control has a value that doesn't fit the rules given by the step attribute.

                             Suffering from a custom error
                             When a control's custom validity error message (as set by the element's setCustomValidity() method) is not the empty string.
                             */

                            var type = ($el.type) ? $el.type.toLowerCase() : null,
                                value,
                                selectedOptions,
                                i,
                                form,
                                radioElements,
                                length,
                                keys,
                                keysLen;

                            if ($el.nodeName.toLowerCase() === 'select') {
                                selectedOptions = [];
                                if (!('selectedOptions' in $el)) {
                                    // less than ie10
                                    length = $el.options.length;
                                    for (i = 0; i < length; i++) {
                                        if ($el.options[i].selected && $el.value !== '') {
                                            selectedOptions[selectedOptions.length] = $el.options[i];
                                        }
                                    }
                                } else {
                                    selectedOptions = $el.selectedOptions;
                                }
                                value = '';
                                for (i = 0; i < selectedOptions.length; i++) {
                                    value += selectedOptions[i].value;
                                    if (i < selectedOptions.length - 1) {
                                        value += ',';
                                    }
                                }
                            } else if (type === 'radio') {
                                value = $el.checked ? $el.value : '';

                                if ($el.name.length > 0) {
                                    form = $el;
                                    while (form) {
                                        if (form.nodeName.toLowerCase() === 'form') {
                                            break;
                                        }
                                        try {
                                            form = form.parentNode;
                                            if (!form.nodeName || form.nodeName.toLowerCase() === 'body') {
                                                form = null;
                                                break;
                                            }
                                        } catch (ex) {
                                            form = null;
                                            break;
                                        }
                                    }
                                    if (form) {
                                        radioElements = form[$el.name];
                                        length = radioElements.length;
                                        for (i = 0; i < length; i++) {
                                            if (radioElements[i].checked) {
                                                value = radioElements[i].value;
                                                break;
                                            }
                                        }
                                    }
                                }
                            } else {
                                value = $el.value;
                            }

                            $el.validity.setValid(true);

                            if ($el.hasAttribute('required') && value.length <= 0) {
                                $el.validity.setValid(false);
                            }
                            if (html5InputPatterns.hasOwnProperty(type) && !html5InputPatterns[type].test(value)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('pattern')) {
                                throw(new Error('checkValidity pattern not supported'));
                            }
                            if ($el.hasAttribute('maxlength') && value.length > parseInt($el.getAttribute('maxlength'), 10)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('min') && parseInt(value, 10) < parseInt($el.getAttribute('min'), 10)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('max') && parseInt(value, 10) > parseInt($el.getAttribute('max'), 10)) {
                                $el.validity.setValid(false);
                            }
                            if ($el.hasAttribute('step')) {
                                throw(new Error('checkValidity step not supported'));
                            }

                            keys = Object.keys(window.ValidityState);
                            keysLen = keys.length;
                            while (keysLen--) {
                                $el.setAttribute(
                                    'data-validity-' + keys[keysLen],
                                    $el.validity[keys[keysLen]]
                                );
                            }

                            if (!$el.validity.valid) {
                                fireInvalidEvent($el);
                            }

                            return $el.validity.valid;
                        };
                    }(el));
                }
                el[bootstrappedKey] = true;

            };


        window.ValidityState = function (valueMissing, typeMismatch, patternMismatch, tooLong, rangeUnderflow, rangeOverflow, stepMismatch, customError, valid) {
            this.valueMissing = parseBoolean(valueMissing);
            this.typeMismatch = parseBoolean(typeMismatch);
            this.patternMismatch = parseBoolean(patternMismatch);
            this.tooLong = parseBoolean(tooLong);
            this.rangeUnderflow = parseBoolean(rangeUnderflow);
            this.rangeOverflow = parseBoolean(rangeOverflow);
            this.stepMismatch = parseBoolean(stepMismatch);
            this.customError = parseBoolean(customError);
            this.valid = parseBoolean(valid, true);

        };
        window.ValidityState.prototype = {
            setValueMissing: function () {
                this.valueMissing = parseBoolean(arguments[0]);
            },
            setTypeMismatch: function () {
                this.typeMismatch = parseBoolean(arguments[0]);
            },
            setPatternMismatch: function () {
                this.patternMismatch = parseBoolean(arguments[0]);
            },
            setTooLong: function () {
                this.tooLong = parseBoolean(arguments[0]);
            },
            setRangeUnderflow: function () {
                this.rangeUnderflow = parseBoolean(arguments[0]);
            },
            setRangeOverflow: function () {
                this.rangeOverflow = parseBoolean(arguments[0]);
            },
            setStepMismatch: function () {
                this.stepMismatch = parseBoolean(arguments[0]);
            },
            setCustomError: function () {
                this.customError = parseBoolean(arguments[0]);
            },
            setValid: function () {
                this.valid = parseBoolean(arguments[0], true);
            }
        };

        return bootstrap
    });

