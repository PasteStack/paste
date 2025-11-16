/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * The paste.js dom module. This is provides utility methods for manipulating and reading the dom.
 *
 * @requires paste
 * @requires paste/util
 * @requires paste/oop
 * @module paste/dom
 */
paste.define(
    'paste.dom',
    [
        'paste.util',
        'paste.oop'
    ],
    function (dom, util, oop) {
        'use strict';

        /*
         * classList.js: Cross-browser full element.classList implementation.
         * 2011-06-15
         *
         * By Eli Grey, http://eligrey.com
         * Public Domain.
         * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
         */

        /*global DOMException */

        /*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

        if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

            if (!('HTMLElement' in window) && !('Element' in window)) {
                return;
            }

            var
                classListProp = "classList"
                , protoProp = "prototype"
                , elemCtrProto = (window.HTMLElement || window.Element)[protoProp]
                , objCtr = Object
                , strTrim = String[protoProp].trim || function () {
                    return this.replace(/^\s+|\s+$/g, "");
                }
                , arrIndexOf = Array[protoProp].indexOf || function (item) {
                    var
                        i = 0
                        , len = this.length
                        ;
                    for (; i < len; i++) {
                        if (i in this && this[i] === item) {
                            return i;
                        }
                    }
                    return -1;
                }
            // Vendors: please allow content code to instantiate DOMExceptions
                , DOMEx = function (type, message) {
                    this.name = type;
                    this.code = DOMException[type];
                    this.message = message;
                }
                , checkTokenAndGetIndex = function (classList, token) {
                    if (token === "") {
                        throw new DOMEx(
                            "SYNTAX_ERR"
                            , "An invalid or illegal string was specified"
                        );
                    }
                    if (/\s/.test(token)) {
                        throw new DOMEx(
                            "INVALID_CHARACTER_ERR"
                            , "String contains an invalid character"
                        );
                    }
                    return arrIndexOf.call(classList, token);
                }
                , ClassList = function (elem) {
                    var
                        trimmedClasses = strTrim.call(elem.className)
                        , classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
                        , i = 0
                        , len = classes.length
                        ;
                    for (; i < len; i++) {
                        this.push(classes[i]);
                    }
                    this._updateClassName = function () {
                        elem.className = this.toString();
                    };
                }
                , classListProto = ClassList[protoProp] = []
                , classListGetter = function () {
                    return new ClassList(this);
                }
                ;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
            DOMEx[protoProp] = Error[protoProp];
            classListProto.item = function (i) {
                return this[i] || null;
            };
            classListProto.contains = function (token) {
                token += "";
                return checkTokenAndGetIndex(this, token) !== -1;
            };
            classListProto.add = function (token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.push(token);
                    this._updateClassName();
                }
            };
            classListProto.remove = function (token) {
                token += "";
                var index = checkTokenAndGetIndex(this, token);
                if (index !== -1) {
                    this.splice(index, 1);
                    this._updateClassName();
                }
            };
            classListProto.toggle = function (token) {
                token += "";
                if (checkTokenAndGetIndex(this, token) === -1) {
                    this.add(token);
                } else {
                    this.remove(token);
                }
            };
            classListProto.toString = function () {
                return this.join(" ");
            };

            if (objCtr.defineProperty) {
                var classListPropDesc = {
                    get : classListGetter, enumerable : true, configurable : true
                };
                try {
                    objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                } catch (ex) { // IE 8 doesn't support enumerable:true
                    if (ex.number === -0x7FF5EC54) {
                        classListPropDesc.enumerable = false;
                        objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
                    }
                }
            } else if (objCtr[protoProp].__defineGetter__) {
                elemCtrProto.__defineGetter__(classListProp, classListGetter);
            }
        }


        var PIXEL = /^[\.\d]+(px)?$/i,
            CONTAINS_NUMBER = /^-?\d/,
            /**
             * @name module:paste/dom~_date
             * @type {Date}
             */
            _date = new Date(),
            /**
             * @name module:paste/dom~$windowStorageKeyPrefix
             * @type {String}
             */
                $windowStorageKeyPrefix = '$JWindowStore-Dom-' + _date.getTime() + '-',
            /**
             * @name module:paste/dom~_html5Supported
             * @type {Boolean}
             */
                _html5Supported = null,
            /**
             * @name module:paste/dom~_html5Elements
             * @type {String[]}
             */
                _html5Elements = ['abbr', 'article', 'aside', 'audio', 'canvas', 'datalist', 'details', 'figcaption', 'figure', 'footer', 'header', 'hgroup', 'mark', 'meter', 'nav', 'output', 'progress', 'section', 'subline', 'summary', 'time', 'video'],
            /**
             * @name module:paste/dom~_html5ProxyDiv
             * @type {HTMLDivElement}
             */
                _html5ProxyDiv = null,

            /**
             * @function module:paste/dom~_getHtml5ProxyDiv
             * @return {HTMLDivElement}
             * @internal
             */
                _getHtml5ProxyDiv = function () {
                if (_html5ProxyDiv === null) {
                    var proxyFrag,
                        length;
                    _html5ProxyDiv = document.createElement('div');
                    _html5ProxyDiv.innerHTML = '<header></header>';

                    proxyFrag = document.createDocumentFragment();
                    length = _html5Elements.length;
                    while (length--) {
                        proxyFrag.createElement(_html5Elements[length]);
                    }
                    proxyFrag.appendChild(_html5ProxyDiv);
                }

                return _html5ProxyDiv;
            };
        /**
         * @function module:paste/dom.getDocumentBody
         * @static
         *
         * @return {HTMLElement}
         */
        dom.getDocumentBody = function () {
            var body = window[$windowStorageKeyPrefix + 'documentBody'];
            if (!body) {
                window[$windowStorageKeyPrefix + 'documentBody'] = body = ((typeof(document.compatMode) === "string" && document.compatMode.indexOf("CSS") >= 0 && document.documentElement) ? document.documentElement : document.body);
            }
            return body;
        };

        /**
         * Tests for HTML5 support by inserting and testing a <header> tag.
         *
         * @function module:paste/dom.getHtml5Supported
         * @static
         *
         * @return {Boolean}
         */
        dom.getHtml5Supported = function () {
            if (_html5Supported === null) {
                var html5Test = document.createElement('div');
                html5Test.innerHTML = '<header></header>';
                _html5Supported = html5Test.childNodes.length > 0;
            }

            return _html5Supported;
        };

        /**
         * @function module:paste/dom.innerHtml5
         * @static
         *
         * @param innerHtml
         * @return {DocumentFragment | String}
         */
        dom.innerHtml5 = function (innerHtml) {
            if (dom.getHtml5Supported()) {
                return innerHtml;
            } else {
                var proxyEl = _getHtml5ProxyDiv(),
                    proxyFrag,
                    length;

                proxyEl.innerHTML = innerHtml;
                length = proxyEl.childNodes.length;
                proxyFrag = document.createDocumentFragment();
                while (length--) {
                    proxyFrag.appendChild(proxyEl.firstChild);
                }

                return proxyFrag;
            }
        };

        /**
         * Returns the number of pixels that the document has already been scrolled horizontally.
         *
         * @function module:paste/dom.getScrollLeft
         * @static
         *
         * @return {Number}
         */

        /**
         * Returns the number of pixels that the document has already been scrolled vertically.
         *
         * @function module:paste/dom.getScrollTop
         * @static
         *
         * @return {Number}
         */

        if (typeof(window.pageXOffset) === "number") {
            dom.getScrollLeft = function () {
                return window.pageXOffset;
            };
            dom.getScrollTop = function () {
                return window.pageYOffset;
            };
        } else if (typeof(dom.getDocumentBody().scrollLeft) === "number") {
            dom.getScrollLeft = function () {
                return dom.getDocumentBody().scrollLeft;
            };
            dom.getScrollTop = function () {
                return dom.getDocumentBody().scrollTop;
            };
        } else {
            dom.getScrollLeft = dom.getScrollTop = function () {
                return NaN;
            };
        }

        /**
         * Returns either the width in pixels of the content of an element or the width of the element itself,
         * whichever is greater.
         *
         * @function module:paste/dom.getScrollWidth
         * @static
         *
         * @return {Number}
         */
        dom.getScrollWidth = function () {
            return dom.getDocumentBody().scrollWidth;
        };

        /**
         * Returns the height of an element's content including content not visible on the screen due to overflow.
         * It includes the element padding but not its margin.
         *
         * @function module:paste/dom.getScrollHeight
         * @static
         *
         * @return {Number}
         */
        dom.getScrollHeight = function () {
            return dom.getDocumentBody().scrollHeight;
        };

        /**
         * Returns the width (in pixels) of the browser window viewport including, if rendered, the vertical scrollbar.
         *
         * @function module:paste/dom.getViewportWidth
         * @static
         *
         * @return {Number}
         */

        /**
         * Returns the height (in pixels) of the browser window viewport including, if rendered, the horizontal scrollbar.
         *
         * @function module:paste/dom.getViewportHeight
         * @static
         *
         * @return {Number}
         */
        if (typeof(window.innerWidth) === "number") {
            dom.getViewportHeight = function () {
                return window.innerHeight;
            };
            dom.getViewportWidth = function () {
                return window.innerWidth;
            };
        } else if (typeof(dom.getDocumentBody().clientWidth) === "number") {
            dom.getViewportHeight = function () {
                return dom.getDocumentBody().clientHeight;
            };
            dom.getViewportWidth = function () {
                return dom.getDocumentBody().clientWidth;
            };
        } else {
            dom.getViewportHeight = dom.getViewportWidth = function () {
                return NaN;
            };
        }

        /**
         * Gets the computed style for a CSS property
         *
         * @function module:paste/dom.getComputedStyle
         * @static
         *
         * @param element
         * @param property
         *
         */
        dom.getComputedStyle = function (element, property, pseudoEl) {
            if (window.getComputedStyle) {
                // Standards-compliant (IE9+)
                return window.getComputedStyle(element, pseudoEl || null).getPropertyValue(property);
            } else if (element.currentStyle) {
                // IE 8-
                return element.currentStyle[property];
            }

            return false;
        };

        /**
         * Show an element using its CSS display property.
         *
         * @function module:paste/dom.show
         * @static
         *
         * @param element
         *
         */
        dom.show = function (element) {
            var displayKey = '$' + _date + ' _dom_hide_display',
                value = element[displayKey];
            element.style.display = value || 'block';
            if (value) {
                delete element[displayKey];
            }
        };

        /**
         * Hide an element using its CSS display property.
         *
         * @function module:paste/dom.hide
         * @static
         *
         * @param element
         *
         */
        dom.hide = function (element) {
            if (element.style.display !== 'none') {
                element['$' + _date + ' _dom_hide_display'] = element.style.display;
                element.style.display = 'none';
            }
        };

        /**
         * Returns the first element within the document that matches the specified group of selectors. IE8+
         *
         * @function module:paste/dom.querySelector
         * @static
         *
         * @param selector
         * @param parent
         * @return {*}
         *
         * @todo Implement parent filtering
         */
        dom.querySelector = function (selector, parent) {
            if (document.querySelector) {
                return (parent || document).querySelector(selector);
            }

            return null;
        };

        /**
         * Returns a list of the elements within the document that match the specified group of selectors. IE8+
         *
         * @function module:paste/dom.querySelectorAll
         * @static
         *
         * @param selector
         * @param parent
         * @return {*}
         *
         * @todo Implement parent filtering
         */
        dom.querySelectorAll = function (selector, parent) {
            if (document.querySelectorAll) {
                return (parent || document).querySelectorAll(selector);
            }

            return [];
        };

        /**
         * Alias for the get method.
         *
         * @function module:paste/dom.get
         * @static
         *
         * @see module:paste/dom.getElement
         */

        /**
         * Returns an element or element list based on the selector being passed.
         * Uses getElementById or querySelectorAll.
         *
         * @function module:paste/dom.getElement
         * @static
         *
         * @param {String} idOrSelector
         * @param {Boolean | HTMLElement} isQueryOrParent
         *
         * @example
         * Get element list based on a class, limiting the search to the specified element.
         * dom.get('.my-class', myContainingElement);
         *
         * Get element based on an id. Note: do not use a hash when querying for an id.
         * dom.get('my-div');
         *
         * Get element list based on a class from the document. Passing true is necessary for class and tag searches.
         * dom.get('.my-class', true);
         * dom.get('section', true);
         */
        dom.get = dom.getElement = function (idOrSelector, isQueryOrParent) {
            // warning: for mobile, just use document.getElementById
            // do not use #my-id if you are just getting the id, please just use 'my-id'
            if (!isQueryOrParent) {
                return document.getElementById(idOrSelector);
            } else if (true === isQueryOrParent) {
                return dom.querySelectorAll(idOrSelector);
            } else {
                return dom.querySelectorAll(idOrSelector, isQueryOrParent);
            }
        };

        /**
         * Scans for the existence of an element by scanning up the DOM tree.
         *
         * @function module:paste/dom.elementExists
         * @static
         *
         * @param {HTMLElement} element
         * @return {Boolean}
         */
        dom.elementExists = function (element) {
            var html = document.body.parentNode;
            while (element) {
                if (element === html) {
                    return true;
                }
                element = element.parentNode;
            }
            return false;
        };

        /**
         * Strips the hash tag from the an id string.
         * E.g. #my-id -> my-id.
         *
         * @function module:paste/dom.stripIdHash
         * @static
         *
         * @param {String} elementId
         * @return {String}
         */
        dom.stripIdHash = function (elementId) {
            if (elementId.charAt(0) === '#') {
                return elementId.slice(1);
            }
            return elementId;
        };

        /**
         * Checks whether an element is contained within another element.
         *
         * @function module:paste/dom.contains
         * @static
         *
         * @param {HTMLElement} parent
         * @param {HTMLElement} child
         * @return {Boolean}
         */
        dom.contains = function (parent, child) {
            if (!parent) {
                return false;
            }

            while (parent) {
                if (parent === child) {
                    return true;
                }

                try {
                    child = child.parentNode;
                    if (!child.tagName || child.tagName.toUpperCase() === "BODY") {
                        break;
                    }
                } catch (ex) {
                    break;
                }
            }

            return false;
        };

        /**
         * Checks whether an element contains a class. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.hasCssClass
         * @static
         *
         * @deprecated Use element.classList.contains
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @return {Boolean}
         */
        dom.hasCssClass = function (element, className) {
            if (!element || !element.classList) {
                return false;
            }

            if (!className) {
                return false;
            }

            return element.classList.contains(className);
        };

        /**
         * Removes a class from an element. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.removeCssClass
         * @static
         *
         * @deprecated Use element.classList.remove
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @return {Boolean}
         */
        dom.removeCssClass = function (element, className) {
            if (!element || !element.classList) {
                return false;
            }
            if (!className) {
                return false;
            }

            element.classList.remove(className);
            return true;
        };

        /**
         * Add a class to an element. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.addCssClass
         * @static
         *
         * @deprecated Use element.classList.add
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @param {Boolean} checkExisting
         * @return {Boolean}
         */
        dom.addCssClass = function (element, className, checkExisting) {
            if (!element || !element.classList) {
                return false;
            }
            if (!className) {
                return false;
            }

            element.classList.add(className);
            return true;
        };

        /**
         * Add or remove a class based on its presence. IE8+ (via a polyfill)
         *
         * @function module:paste/dom.toggleCssClass
         * @static
         *
         * @deprecated Use element.classList.toggle
         *
         * @param {HTMLElement} element
         * @param {String} className
         * @return {Boolean}
         */
        dom.toggleCssClass = function (element, className) {
            if (!element || !element.classList) {
                return false;
            }
            if (!className) {
                return false;
            }

            element.classList.toggle(className);
            return true;
        };

        /**
         * Returns a document fragment containing the markup passed as a string.
         *
         * @function module:paste/dom.createFragment
         * @static
         *
         * @param {String} string
         * @param {String} [proxyElementType='div'] proxyElementType
         * @return {DocumentFragment}
         */
        dom.createFragment = function (string, proxyElementType) {
            var frag = document.createDocumentFragment(),
                proxy = document.createElement(proxyElementType || 'div');
            proxy.innerHTML = string;

            while (proxy.firstChild) {
                frag.appendChild(proxy.firstChild);
            }

            return frag;
        };

        /**
         * Returns a pixel value for an element's property
         *
         * @function module:paste/dom.getPixelValue
         * @static
         *
         * @param {HTMLElement} target
         * @param {String} value
         * @return {DocumentFragment}
         */
        dom.getPixelValue = function(target, value) {
                var __ret = value;
                if (!PIXEL.test(value) && CONTAINS_NUMBER.test(value) && target.runtimeStyle) {
                    var style = target.style.left,
                        runtimeStyle = target.runtimeStyle.left;
                    target.runtimeStyle.left = target.currentStyle.left;
                    target.style.left = value || 0;
                    value = target.style.pixelLeft;
                    target.style.left = style;
                    target.runtimeStyle.left = runtimeStyle;

                    __ret = value + 'px';
                }

                return __ret;

            };

        /**
         * @class module:paste/dom.Point
         * @augments module:paste/oop.Class
         * @static
         *
         * @param {Number} [x=0]
         * @param {Number} [y=0]
         */
        dom.Point = oop.Class.create({
            init : function (x, y) {
                this.x = x || 0;
                this.y = y || 0;
            },

            /**
             * @function module:paste/dom.Point#combine
             * @param {module:paste/dom.Point} point
             * @return {module:paste/dom.Point}
             */
            combine : function (point) {
                return new dom.Point(
                    this.x += point.x,
                    this.y += point.y
                );
            }
        });

        /**
         * @function module:paste/dom.Point.fromJQuery
         * @static
         *
         * @param {Object} jQueryPosition
         * @property {Number} jQueryPosition.left
         * @property {Number} jQueryPosition.top
         * @return {module:paste/dom.Point}
         */
        dom.Point.fromJQuery = function (jQueryPosition) {
            return new dom.Point(jQueryPosition.left, jQueryPosition.top);
        };

        /**
         * @class module:paste/dom.Size
         * @augments module:paste/oop.Class
         * @static
         *
         * @param {Number} [width=0]
         * @param {Number} [height=0]
         */
        dom.Size = oop.Class.create({
            init : function (width, height) {
                this.width = width || 0;
                this.height = height || 0;
            }
        });

        /**
         * @function module:paste/dom.Size.fromElement
         * @static
         *
         * @param {HTMLElement} element
         * @return {module:paste/dom.Size}
         */
        dom.Size.fromElement = function (element) {
            if (!element) {
                return new dom.Size();
            }

            return new dom.Size(element.offsetWidth, element.offsetHeight);
        };

        /**
         * @class module:paste/dom.Bounds
         * @augments module:paste/oop.Class
         * @static
         *
         * @param {Number} [left=0]
         * @param {Number} [top=0]
         * @param {Number} [width=0]
         * @param {Number} [height=0]
         */
        dom.Bounds = oop.Class.create({
            init : function (left, top, width, height) {
                this.left = left || 0;
                this.top = top || 0;
                this.width = width || 0;
                this.height = height || 0;
            },

            /**
             * @function module:paste/dom.Bounds#getRight
             * @return {Number}
             */
            getRight : function () {
                return this.left + this.width;
            },

            /**
             * @function module:paste/dom.Bounds#getBottom
             * @return {Number}
             */
            getBottom : function () {
                return this.top + this.height;
            },

            /**
             * @function module:paste/dom.Bounds#contains
             *
             * @param {Object} point
             * @property {Number} point.x
             * @property {Number} point.y
             *
             * @return {Boolean}
             */
            contains : function (point) {
                if ((this.top > point.y) || (this.getBottom() < point.y)) {
                    return false;
                }

                return !((this.left > point.x) || (this.getRight() < point.x));
            }
        });

        /**
         * @function module:paste/dom.Bounds.fromElement
         * @static
         *
         * @param {HTMLElement} element
         * @return {module:paste/dom.Bounds}
         */
        dom.Bounds.fromElement = function (element) {
            if (!element || element.style.display === "none") {
                return new dom.Bounds();
            }

            var box,
                bounds;
            if (element.getBoundingClientRect) {
                try {
                    if (element.tagName === "HTML") {
                        return new dom.Bounds();
                    }

                    box = element.getBoundingClientRect();
                    return new dom.Bounds(
                        box.left - dom.getDocumentBody().clientLeft + dom.getScrollLeft(),
                        box.top - dom.getDocumentBody().clientTop + dom.getScrollTop(),
                        element.offsetWidth,
                        element.offsetHeight);
                } catch (boundingEx) {
//                log.warn(boundingEx);
                }
            }

            // old firefox hack
            if (document.getBoxObjectFor) {
                try {
                    box = document.getBoxObjectFor(element);
                    return new dom.Bounds(box.x, box.y, element.offsetWidth, element.offsetHeight);
                } catch (boxObjEx) {
//                log.warn(boxObjEx);
                }
            }

            bounds = new dom.Bounds(element.offsetLeft, element.offsetTop, element.offsetWidth, element.offsetHeight);
            try {
                while ((element = element.offsetParent) !== null) {
                    bounds.left += element.offsetLeft;
                    bounds.top += element.offsetTop;

                    if (element === document.body) {
                        break;
                    }
                }
            } catch (boundsEx) {
//            log.warn(boundsEx);
            }

            return bounds;
        };

        /**
         * @class module:paste/dom.MarkupWriter
         * @augments module:paste/oop.Class
         * @static
         *
         * @property {Array} writer
         */
        dom.MarkupWriter = oop.Class.create({
            init : function () {
                this.writer = [];
            },

            /**
             * @function module:paste/dom.MarkupWriter#toString
             * @return {String}
             */
            toString : function () {
                return this.writer.join('');
            },

            /**
             * @function module:paste/dom.MarkupWriter#toFragment
             * @return {DocumentFragment}
             */
            toFragment : function () {
                return dom.createFragment(this.toString());
            },

            /**
             * @function module:paste/dom.MarkupWriter#push
             * @param {String} string
             */
            push : function (string) {
                this.writer.push(string);
            },

            /**
             * @function module:paste/dom.MarkupWriter#append
             * @param {String} string
             */
            append : function (string) {
                this.push(string);
            },

            /**
             * @function module:paste/dom.MarkupWriter#clear
             */
            clear : function () {
                this.dispose();
                this.writer = [];
            },

            /**
             * @function module:paste/dom.MarkupWriter#dispose
             */
            dispose : function () {
                var reset = this.reset;
                this.writer = reset;
                delete this.writer;
            },

            /**
             * @function module:paste/dom.MarkupWriter#length
             * @return {Number}
             */
            length : function () {
                return this.writer.length;
            },

            /**
             * @function module:paste/dom.MarkupWriter#isEmpty
             * @return {Boolean}
             */
            isEmpty : function () {
                return this.writer.length === 0;
            }
        });

        /**
         * @function module:paste/dom.MarkupWriter.create
         * @static
         *
         * @return {module:paste/dom.MarkupWriter}
         */
        dom.MarkupWriter.create = function () {
            return new dom.MarkupWriter();
        };
    }
);
