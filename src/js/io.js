/*!
 * Copyright (c) 2025–present Tomshley LLC
 * GitHub: https://github.com/sgoggles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
        _requestId = Number(new Date()),
        /**
         * @class module:paste/io~_Request
         * @return {XMLHttpRequest | ActiveXObject}
         * @internal
         */
        _Request = function () {
            var progIds = ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'],
                request = null,
                i;
            if (window.XMLHttpRequest !== undefined) {
                return new window.XMLHttpRequest();
            }
            i = 0;
            while (i < progIds.length && request === null) {
                try {
                    request = new ActiveXObject(progIds[i]);
                } catch (ignore) {
                    request = null;
                }
                i += 1;
            }
            return request;
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
     * @param {Boolean} [isAsync=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.open = function (method, url, onSuccess, onFailure, context, isAsync) {
        var request = _Request();
        if (request === null) {
            return null;
        }

        request.open(method, url, (false !== isAsync));

        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        if (_requestId) {
            request.setRequestHeader('X-Request-Id', _requestId);
        }

        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                var responseType = request.getResponseHeader('content-type') || '',
                    response,
                    failed = (request.status < 200 || request.status >= 300);
                if (responseType === JSON_CTYPE || responseType.slice(0, JSON_CTYPE_CHSET.length) === JSON_CTYPE_CHSET) {
                    // A JSON body that does not parse is a failed reply:
                    // onFailure gets the raw text whatever the status says.
                    try {
                        response = JSON.parse(request.responseText);
                    } catch (ignore) {
                        failed = true;
                        response = request.responseText;
                    }
                } else {
                    response = request.responseText || request.responseXML;
                }
                if (!failed) {
                    if (util.isFunction(onSuccess)) {
                        if (context) {
                            onSuccess.apply(context, [response, request.status, request]);
                        } else {
                            onSuccess(response, request.status, request);
                        }
                    }
                } else if (util.isFunction(onFailure)) {
                    if (context) {
                        onFailure.apply(context, [response, request.status, request]);
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
     * @param {Boolean} [isAsync=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.get = function (url, data, onSuccess, onFailure, context, isAsync) {
        var request = io.open('GET', util.searchParamsAppend(url, data), onSuccess, onFailure, context, isAsync);
        if (request === null) {
            return null;
        }
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
     * @param {Boolean} [isAsync=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.post = function (url, data, onSuccess, onFailure, context, isAsync) {
        var request = io.open('POST', url, onSuccess, onFailure, context, isAsync);
        if (request === null) {
            return null;
        }
        if (window.FormData && FormData.prototype.isPrototypeOf(data)) {
            request.send(data);
        } else if (window.PasteIOFormData && PasteIOFormData.prototype.isPrototypeOf(data) && data.encode) {
            request.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + data['boundary']);
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
     * @param {Boolean} [isAsync=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.del = function (url, data, onSuccess, onFailure, context, isAsync) {
        var request = io.open('DELETE', url, onSuccess, onFailure, context, isAsync);
        if (request === null) {
            return null;
        }
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
     * @param {Boolean} [isAsync=true]
     * @return {XMLHttpRequest | ActiveXObject}
     */
    io.put = function (url, data, onSuccess, onFailure, context, isAsync) {
        var request = io.open('PUT', url, onSuccess, onFailure, context, isAsync);
        if (request === null) {
            return null;
        }
        request.send(util.searchParamsAppend(null, data));

        return request;
    };
});