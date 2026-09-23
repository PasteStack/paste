const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function fixture(options = {}) {
    const requests = [];
    const FakeXMLHttpRequest = function () {
        const requestHeaders = new Map();
        const responseHeaders = new Map();
        const request = {
            requestHeaders,
            readyState: 0,
            status: 0,
            responseText: '',
            responseXML: null,
            sent: undefined,
            method: undefined,
            url: undefined,
            async: undefined,
            onreadystatechange: undefined,
            open(method, url, async) {
                request.method = method;
                request.url = url;
                request.async = async;
            },
            setRequestHeader(name, value) {
                requestHeaders.set(name.toLowerCase(), value);
            },
            getResponseHeader(name) {
                const key = name.toLowerCase();
                return responseHeaders.has(key) ? responseHeaders.get(key) : null;
            },
            send(body) {
                request.sent = body;
            },
            // Simulate the response arriving; omit contentType for a reply that
            // carries no Content-Type header at all (status 0, network failure).
            complete(status, contentType, body) {
                request.status = status;
                request.responseText = body === undefined ? '' : body;
                if (contentType !== undefined) {
                    responseHeaders.set('content-type', contentType);
                }
                request.readyState = 4;
                request.onreadystatechange();
            }
        };
        requests.push(request);
        return request;
    };
    const util = {
        isFunction: value => typeof value === 'function',
        searchParamsAppend(url, parameters) {
            let parameterString = '';
            if (typeof parameters === 'string') {
                parameterString = parameters;
            } else if (parameters && typeof parameters === 'object') {
                parameterString = Object.keys(parameters)
                    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(parameters[key]))
                    .join('&');
            }
            if (!url) {
                return parameterString;
            }
            return parameterString ? url + (url.indexOf('?') === -1 ? '?' : '&') + parameterString : url;
        }
    };
    const exports = {};
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/js/io.js'), 'utf8'), {
        window: {XMLHttpRequest: (options.noXhr || options.activeX) ? undefined : FakeXMLHttpRequest},
        XMLHttpRequest: (options.noXhr || options.activeX) ? undefined : FakeXMLHttpRequest,
        ActiveXObject: options.activeX,
        FormData: undefined,
        paste: {define(name, deps, factory) {
            assert.equal(name, 'paste.io');
            assert.equal(deps.length, 1);
            assert.equal(deps[0], 'paste.util');
            factory(exports, util);
        }}
    });
    return {io: exports, requests};
}

test('a response without a Content-Type header calls onFailure without throwing', () => {
    const f = fixture();
    const outcomes = [];
    const request = f.io.open('GET', '/unreachable', () => outcomes.push('success'), (response, status, req) => outcomes.push(['failure', response, status, req]));
    assert.doesNotThrow(() => request.complete(0));
    assert.equal(outcomes.length, 1);
    assert.equal(outcomes[0][0], 'failure');
    assert.equal(outcomes[0][2], 0);
    assert.equal(outcomes[0][3], request);
});

test('an application/json response is parsed before onSuccess', () => {
    const f = fixture();
    const outcomes = [];
    const request = f.io.open('GET', '/data', response => outcomes.push(response));
    request.complete(200, 'application/json', '{"ok":true,"n":2}');
    assert.equal(JSON.stringify(outcomes), JSON.stringify([{ok: true, n: 2}]));
});

test('a parameterized application/json content type is parsed', () => {
    const f = fixture();
    const outcomes = [];
    const request = f.io.open('GET', '/data', response => outcomes.push(response));
    request.complete(200, 'application/json; charset=utf-8', '[1,2]');
    assert.equal(JSON.stringify(outcomes), JSON.stringify([[1, 2]]));
});

test('every request carries X-Requested-With: XMLHttpRequest', () => {
    const f = fixture();
    const request = f.io.open('GET', '/anything');
    assert.equal(request.requestHeaders.get('x-requested-with'), 'XMLHttpRequest');
});

test('a non-JSON failure passes the response text and status to onFailure', () => {
    const f = fixture();
    const outcomes = [];
    const request = f.io.open('GET', '/missing', null, (response, status) => outcomes.push([response, status]));
    request.complete(404, 'text/html; charset=utf-8', '<h1>Not found</h1>');
    assert.deepEqual(outcomes, [['<h1>Not found</h1>', 404]]);
});

test('an unparseable application/json body calls onFailure with the raw text', () => {
    const f = fixture();
    const outcomes = [];
    const request = f.io.open('GET', '/data', () => outcomes.push('success'), (response, status, req) => outcomes.push(['failure', response, status, req]));
    assert.doesNotThrow(() => request.complete(200, 'application/json', '{bad json'));
    assert.equal(outcomes.length, 1);
    assert.equal(outcomes[0][0], 'failure');
    assert.equal(outcomes[0][1], '{bad json');
    assert.equal(outcomes[0][2], 200);
    assert.equal(outcomes[0][3], request);
});

test('an unparseable application/json error body calls onFailure with the raw text', () => {
    const f = fixture();
    const outcomes = [];
    const request = f.io.open('GET', '/data', null, (response, status) => outcomes.push([response, status]));
    assert.doesNotThrow(() => request.complete(500, 'application/json; charset=utf-8', 'not json'));
    assert.deepEqual(outcomes, [['not json', 500]]);
});

test('get returns null without sending when no request object is available', () => {
    const f = fixture({noXhr: true});
    assert.equal(f.io.get('/anything'), null);
    assert.equal(f.requests.length, 0);
});

test('post returns null without sending when no request object is available', () => {
    const f = fixture({noXhr: true});
    assert.equal(f.io.post('/submit', 'a=1'), null);
    assert.equal(f.requests.length, 0);
});

test('del and put return null without sending when no request object is available', () => {
    const f = fixture({noXhr: true});
    assert.equal(f.io.del('/x'), null);
    assert.equal(f.io.put('/x', 'a=1'), null);
    assert.equal(f.requests.length, 0);
});

test('the ActiveX fallback tries each progId in order and returns the first that constructs', () => {
    const progIds = [];
    const recognisable = {
        open() { },
        setRequestHeader() { }
    };
    function FakeActiveXObject(progId) {
        progIds.push(progId);
        if (progId !== 'Msxml2.XMLHTTP') {
            throw new Error('cannot create ' + progId);
        }
        return recognisable;
    }
    const f = fixture({activeX: FakeActiveXObject});
    const request = f.io.open('GET', '/legacy');
    assert.deepEqual(progIds, ['Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.3.0', 'Msxml2.XMLHTTP']);
    assert.equal(request, recognisable);
});

test('post sends a string body as application/x-www-form-urlencoded', () => {
    const f = fixture();
    const request = f.io.post('/submit', 'a=1&b=2');
    assert.equal(request.method, 'POST');
    assert.equal(request.requestHeaders.get('content-type'), 'application/x-www-form-urlencoded');
    assert.equal(request.sent, 'a=1&b=2');
});
