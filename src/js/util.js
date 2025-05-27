/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * The paste.js util module. This is a lightweight collection of static methods to help perform manipulation of basic types.
 * Note - paste.js already polyfills Object.keys We do not need an object polyfill here
 * @requires paste
 * @module paste/util
 */

paste.define('paste.util', function (util) {
    'use strict';

    /**
     * Bare bones iterator. Context is supported but at almost a 10x performance decrease. Use with caution
     * In the callback you may return true to break out of the loop
     *
     * @function module:paste/util.each
     * @param array
     * @param {Function} callback
     * @param {Object} context
     *
     */
    util.each = function (array, callback, context) {
        var i = 0,
            len = array.length;

        if (context) {
            for (i; i < len; i += 1) {
                if (callback.call(context, array[i], i)) {
                    break;
                }
            }
        } else {
            for (i; i < len; i += 1) {
                if (callback(array[i], i)) {
                    break;
                }
            }
        }
    };

    util.range = function (begin, end) {
        var i, result = [];
        for (i = begin; i < end; ++i) {
            result.push(i);
        }
        return result;
    };

    /**
     * Merges two objects. Optionally overwrite the target object's properties with the source properties.
     *
     * @function module:paste/util.mixin
     * @param target
     * @param source
     * @param overwrite
     * @return {Object}
     */
    util.mixin = function (target, source, overwrite) {
        target = target || {};
        overwrite = util.parseBoolean(overwrite, false);
        var propName;

        if (!source) {
            return target;
        }

        for (propName in source) {
            if (source.hasOwnProperty(propName)) {
                if (overwrite || !target.hasOwnProperty(propName)) {
                    target[propName] = source[propName];
                }
            }
        }

        return target;
    };

    /**
     * Checks to see if an object has any properties of its own.
     *
     * @function module:paste/util.isEmptyObject
     * @param value
     * @return {Boolean}
     */
    util.isEmptyObject = function (value) {
        if (util.isObject(value) === false) {
            //console.warn('util.isEmptyObject: value is not an object'); // TODO - tom - implement error handling
        }

        for (var name in value) {
            if (value.hasOwnProperty(name)) {
                return false;
            }
        }
        return true;
    };

    /**
     * Trim whitespace
     *
     * @function module:paste/util.trim
     * @param value
     * @return {Boolean}
     */
    util.trim = function (value) {
        return value.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };

    /**
     * Trim whitespace
     *
     * @function module:paste/util.trim
     * @param value
     * @return {Boolean}
     */
    util.trimSafe = function (value) {
        return (util.isString(value)) ? value.replace(/^\s\s*/, '').replace(/\s\s*$/, '') : value;
    };

    /**
     * Tests to see if a string is empty (after being trimmed)
     *
     * @function module:paste/util.isEmptyString
     * @param value
     * @return {Boolean}
     */
    util.isEmptyString = function (value) {
        return (util.isString(value) === false) || !util.trim(value);
    };

    /**
     * Determine whether the argument is an array.
     *
     * @function module:paste/util.isArray
     * @param value
     * @return {Boolean}
     */
    util.isArray = function (value) {
        return typeof(value) === 'array' || (value !== null && typeof(value) === 'object' && value instanceof Array);
    };

    /**
     * Determine whether the argument is a boolean.
     *
     * @function module:paste/util.isBoolean
     * @param value
     * @return {Boolean}
     */
    util.isBoolean = function (value) {
        return typeof(value) === 'boolean' || (value !== null && typeof(value) === 'object' && value instanceof Boolean);
    };

    /**
     * Attempt to convert a value into a boolean
     *
     * @function module:paste/util.parseBoolean
     * @param value
     * @param defaultValue
     * @return {Boolean}
     */
    util.parseBoolean = function (value, defaultValue) {
        var parse = function (val) {
                if (util.isBoolean(val)) {
                    return val;
                } else if (util.isString(val)) {
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
    };

    /**
     * Determine whether the argument is a function.
     *
     * @function module:paste/util.isFunction
     * @param value
     * @return {Boolean}
     */
    util.isFunction = function (value) {
        return typeof(value) === 'function' || (value !== null && typeof(value) === 'object' && value instanceof Function);
    };

    /**
     * Determine whether the argument is a number.
     *
     * @function module:paste/util.isNumber
     * @param value
     * @return {Boolean}
     */
    util.isNumber = function (value) {
        return !isNaN(value) && (typeof(value) === 'number' || (value !== null && typeof(value) === 'object' && value instanceof Number));
    };

    /**
     * Determine whether the argument is a string.
     *
     * @function module:paste/util.isString
     * @param value
     * @return {Boolean}
     */
    util.isString = function (value) {
        return typeof(value) === 'string' || (value !== null && typeof(value) === 'object' && value instanceof String);
    };

    /**
     * Determine whether the passed string is not empty.
     *
     * @function module:paste/util.isNonEmptyString
     * @param value
     * @return {Boolean}
     */
    util.isNonEmptyString = function (value) {
        return (util.isString(value) === true) && util.trim(value).length > 0;
    };

    /**
     * Determine whether the argument is an object.
     *
     * @function module:paste/util.isObject
     * @param value
     * @return {Boolean}
     */
    util.isObject = function (value) {
        if (!value) {
            return false;
        }
        return(typeof(value) === 'object' || util.isArray(value) || util.isFunction(value));
    };

    /**
     * Determine whether the given object has a valid method.
     *
     * @function module:paste/util.hasMethod
     * @param object
     * @param method
     * @return {Boolean}
     */
    util.hasMethod = function (object, method) {
        return (util.isObject(object) && util.isFunction(object[method]));
    };

    /**
     * Determine whether a value exists within a range
     *
     * @function module:paste/util.numberInRange
     * @param value
     * @param min
     * @param max
     * @return {Boolean}
     */
    util.numberInRange = function (value, min, max) {
        //deprecate .inRange
        return !(value < min || value > max);
    };

    /**
     * Clone a function.
     *
     * @function module:paste/util.cloneFunction
     * @param value
     * @return {Function}
     */
    util.cloneFunction = function (value) {
        if (util.isFunction(value) === false) {
            throw 'Utility.cloneFunction: you passed a value that is not a function';
        }
        var property,
            clonedFunction = function () {
                return value.apply(this, arguments);
            };

        clonedFunction.prototype = value.prototype;
        for (property in value) {
            if (value.hasOwnProperty(property) && property !== 'prototype') {
                clonedFunction[property] = value[property];
            }
        }

        return clonedFunction;
    };

    /**
     * @function module:paste/util.cloneObject
     * @param obj
     * @return {Object}
     */
    util.cloneObject = function (obj) {
        // Handle the 3 simple types, and null or undefined
        if (null === obj || "object" !== typeof obj) { return obj; }
        var copy, len, i, attr;
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        // Handle Array
        if (obj instanceof Array) {
            copy = [];
            len = obj.length;
            for (i = 0; i < len; ++i) {
                copy[i] = this.clone(obj[i]);
            }
            return copy;
        }
        // Handle Object
        if (obj instanceof Object) {
            copy = {};
            for (attr in obj) {
                if (obj.hasOwnProperty(attr)) { copy[attr] = this.cloneObject(obj[attr]); }
            }
            return copy;
        }
        throw "Unable to copy obj! Its type isn't supported.";
    };

    /**
     * Convert a hyphenated string into camelCase.
     *
     * @function module:paste/util.toCamelCase
     * @param value
     * @return {String}
     */
    util.toCamelCase = function (value) {
        return value.replace(/(\-[a-z])/g, function ($1) {return $1.toUpperCase().replace('-', '');});
    };

    /**
     * Hyphenates a camelCased string.
     *
     * @function module:paste/util.toDashed
     * @param value
     * @return {String}
     */
    util.toDashed = function (value) {
        return value.replace(/([A-Z])/g, function ($1) {return '-' + $1.toLowerCase();});
    };

    /**
     * Converts a camelCased string into an underscored_string.
     *
     * @function module:paste/util.toUnderscored
     * @param value
     * @return {String}
     */
    util.toUnderscored = function (value) {
        return value.replace(/([A-Z])/g, function ($1) {return '_' + $1.toLowerCase();});
    };

    /**
     * Determine whether the given string starts with the given character.
     *
     * @function module:paste/util.stringStartsWith
     * @param string
     * @param value
     * @return {Boolean}
     */
    util.stringStartsWith = function (string, value) {
        //deprecate .startsWith
        return string && string.slice(0, value.length) === value;
    };

    /**
     * Determine whether the given string ends with the given character.
     *
     * @function module:paste/util.stringEndsWith
     * @param string
     * @param value
     * @return {Boolean}
     */
    util.stringEndsWith = function (string, value) {
        //deprecate .endsWith
        return string && string.slice(-value.length) === value;
    };

    /**
     *
     * @function module:paste/util.arrayContains
     * @param {Array}array
     * @param value
     * @return {Boolean}
     */
    util.arrayContains = function (array, value) {
        var i = array.length;

        while (i--) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    };

    /**
     * Appends parameters to window.location.search and returns an updated value
     *
     * @function module:paste/util.searchParamsAppend
     * @param url
     * @param parameters
     * @return {String}
     */
    util.searchParamsAppend = function (url, parameters) {
        var parameterString = '',
            empty,
            params,
            curName,
            i,
            length,
            keys;

        if (util.isString(parameters)) {
            parameterString = parameters;
        } else if (util.isObject(parameters)) {
            empty = { };
            params = [];
            i = 0;
            keys = Object.keys(parameters);
            length = keys.length;
            for (i; i < length; i += 1) {
                curName = keys[i];
                if ((typeof(empty[curName]) === "undefined" || parameters[curName] !== empty[curName]) && curName !== "length") {
                    params.push(encodeURIComponent(curName) + "=" + encodeURIComponent(parameters[curName]));
                }
            }

            parameterString = params.join("&");
        }

        if (!parameterString) {
            return url;
        }

        if (!url) {
            return parameterString;
        }

        return url + ( url.indexOf("?") ? "?" : "&" ) + parameterString;
    };

    /**
     * Parses window.location.search and returns a dictionary (object) representation
     *
     * @function module:paste/util.getSearchParams
     * @return {Object}
     */
    util.getSearchParams = function () {
        // deprecate .getQueryParams
        var
            baseQuery = window.location.search,
            subQuery = '',
            queryObj = {},
            i,
            len;
        baseQuery = baseQuery.replace('?', '').split('&');
        len = baseQuery.length;
        for (i = 0; i < len; i++) {
            subQuery = baseQuery[i].split('=');
            queryObj[subQuery[0]] = subQuery[1];
        }
        return queryObj;
    };

    /**
     * Custom implementation of HTML5 dataset because native HTML5 dataset is slow.
     * Reads and stores data attributes on an element only when get or set are first called. The set method will
     * overwrite existing values (if present).
     *
     * Inspired by: http://calendar.perfplanet.com/2012/efficient-html5-data-attributes/
     *
     * @function module:paste/util.dataset
     * @return {Object}
     */
    util.dataset = (function () {
        var storage = {},
            initStarted = false,
            initCompleted = false,
            publicMethods = {
                reset: function () {
                    storage = {};
                },
                set: function (dom, data) {
                    if (!dom.__data) {
                        dom.__data = {};
                    }

                    if (!initStarted && !initCompleted) {
                        init(dom);
                    }

                    storage[dom.__data] = util.mixin(storage[dom.__data], data, true);
                },
                get: function (dom, prop) {
                    if (!initStarted && !initCompleted) {
                        init(dom);
                    }

                    return (prop) ? storage[dom.__data][prop] : storage[dom.__data];
                }
            },
            init = function (element) {
                // go through each attribute and save the value to storage
                initStarted = true;

                util.each(element.attributes, function (att, i) {
                    if (/^data-/.test(att.name)) {
                        var obj = {},
                            prop = util.toCamelCase(att.name.slice(5));

                        obj[prop] = att.value;

                        publicMethods.set(element, obj);
                    }
                });

                initCompleted = true;
            };

        return publicMethods;
    })();
});