/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste, ActiveXObject, FormData */

/**
 * The paste.js I/O module. This is provides support for I/O operations.
 *
 * @requires paste
 * @requires paste/util
 * @module paste/io
 *
 * @todo Support for JSONP
 * @todo Support for Websockets
 */
paste.define('paste.io', ['paste.util'], function (io, util) {
    'use strict';

    /**
     * @name module:paste/io~_requestId
     * @type {number}
     * @internal
     */
    var JSON_CTYPE = 'application/json',
        JSON_CTYPE_CHSET = JSON_CTYPE + ';',
        _requestId = new Date().getTime(),
        /**
         * @class module:paste/io~_Request
         * @return {XMLHttpRequest | ActiveXObject}
         * @internal
         */
        _Request = function () {
            if (typeof (XMLHttpRequest) !== 'undefined') {
                return new XMLHttpRequest();
            }

            try {
                return new ActiveXObject('Msxml2.XMLHTTP.6.0');
            } catch (e0) { }
            try {
                return new ActiveXObject('Msxml2.XMLHTTP.3.0');
            } catch (e1) { }
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e2) { }
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e3) { }

            return null;
        };

    /**
     * @function module:paste/io.setRequestId
     * @static
     *
     * @param requestId
     */
    io.setRequestId = function (requestId) {
        _requestId = requestId;
    };

    /**
     * @function module:paste/io.open
     * @static
     *
     * @param method
     * @param {String} url
     * @param onSuccess
     * @param onFailure
     * @param {Object} [context]
     * @param {Boolean} [async=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.open = function (method, url, onSuccess, onFailure, context, async) {
        var request = _Request();
        if (request === null) {
            return null;
        }

        request.open(method, url, (false !== async));

        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        if (_requestId) {
            request.setRequestHeader('X-Request-Id', _requestId);
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                var responseType = request.getResponseHeader('content-type'),
                    response = ((responseType === JSON_CTYPE || responseType.slice(0, JSON_CTYPE_CHSET.length) === JSON_CTYPE_CHSET) ? JSON.parse(request.responseText) : (request.responseText || request.responseXML));
                if (request.status >= 200 && request.status < 300) {
                    if (util.isFunction(onSuccess)) {
                        if (context) {
                            onSuccess.apply(context || this, [response, request.status, request]);
                        } else {
                            onSuccess(response, request.status, request);
                        }
                    }
                } else if (util.isFunction(onFailure)) {
                    if (context) {
                        onFailure.apply(context || this, [response, request.status, request]);
                    } else {
                        onFailure(response, request.status, request);
                    }
                }
            }
        };
        return request;
    };

    /**
     * @function module:paste/io.get
     * @static
     *
     * @param {String} url
     * @param {Object} [data]
     * @param {String} [onSuccess]
     * @param {String} [onFailure]
     * @param {Object} [context]
     * @param {Boolean} [async=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.get = function (url, data, onSuccess, onFailure, context, async) {
        var request = io.open('GET', util.searchParamsAppend(url, data), onSuccess, onFailure, context, async);
        request.send('');

        return request;
    };

    /**
     * @function module:paste/io.post
     * @static
     *
     * @param {String} url
     * @param {Object} [data]
     * @param {String} [onSuccess]
     * @param {String} [onFailure]
     * @param {Object} [context]
     * @param {Boolean} [async=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.post = function (url, data, onSuccess, onFailure, context, async) {
        var request = io.open('POST', url, onSuccess, onFailure, context, async);
        if (window.FormData && data instanceof FormData) {
            request.send(data);
        } else if (window.PasteIOFormData && data instanceof PasteIOFormData && data.encode) {
            request.setRequestHeader("Content-Type", 'multipart/form-data; boundary=' + data['boundary']);
            request.send(data['encode']());
        } else {
            request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.send(util.searchParamsAppend(null, data));
        }


        return request;
    };

    /**
     * @function module:paste/io.delete
     * @static
     *
     * @param {String} url
     * @param {Object} [data]
     * @param {String} [onSuccess]
     * @param {String} [onFailure]
     * @param {Object} [context]
     * @param {Boolean} [async=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.del = function (url, data, onSuccess, onFailure, context, async) {
        var request = io.open('DELETE', url, onSuccess, onFailure, context, async);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        request.send(util.searchParamsAppend(null, data));

        return request;
    };

    io['delete'] = io.del;

    /**
     * @function module:paste/io.put
     * @static
     *
     * @param {String} url
     * @param {Object} [data]
     * @param {String} [onSuccess]
     * @param {String} [onFailure]
     * @param {Object} [context]
     * @param {Boolean} [async=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.put = function (url, data, onSuccess, onFailure, context, async) {
        var request = io.open('PUT', url, onSuccess, onFailure, context, async);
        request.send(util.searchParamsAppend(null, data));

        return request;
    };
});