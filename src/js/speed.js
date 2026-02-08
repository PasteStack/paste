/*!
 * Copyright (c) 2025 Thomas Schena
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
/*globals paste */

/**
 * The paste.js speed module. This is provides support for monitoring client speed in real time.
 * @see https://developer.mozilla.org/en/Navigation_timing
 * @see http://blogs.msdn.com/b/ie/archive/2010/11/09/web-page-performance-in-a-standards-compliant-and-interoperable-way.aspx
 *
 * @requires paste
 * @requires paste/util
 * @requires paste/event
 * @module paste/speed
 *
 */

paste.define('paste.speed', ['paste.util', 'paste.event'], function (speed, util, event) {
    'use strict';

    /*
     ORDERED EVENTS
     w3c                         ms
     navigationStart             navigationStart;
     unloadEventStart            unloadEventStart;
     unloadEventEnd              unloadEventEnd;
     redirectStart               redirectStart;
     redirectEnd                 redirectEnd;
     fetchStart                  fetchStart;
     domainLookupStart           domainLookupStart;
     domainLookupEnd             domainLookupEnd;
     connectStart                connectStart;
     connectEnd                  connectEnd;
     secureConnectionStart
     requestStart                requestStart;
     responseStart               responseStart;
     responseEnd                 responseEnd;
     domLoading                  domLoading;
     domInteractive              domInteractive;
     domContentLoadedStart
     domContentLoadedEnd         domContentLoaded;
     domComplete                 domComplete;
     loadEventStart              loadEventStart;
     loadEventEnd                loadEventEnd;
     */

    var w = window,
        pasteInstanceStart = paste.instanceStart,
        performance = w.performance || w.mozPerformance || w.msPerformance || w.webkitPerformance || {},
        timing = performance.timing || {},
        navigation = performance.navigation || {},
        completePostTimeout,
        onCompleteEvent = new event.Event(),
        onWindowLoaded = function () {
            var keys,
                i,
                len,
                key,
                obj;

            speed['page'] = w.location.href;

            if (util.hasMethod(timing, 'hasOwnProperty')) {
                obj = timing;
            } else {
                keys = Object.keys(timing);
                len = keys.length;
                obj = {};
                for (i = 0; i < len; i += 1) {
                    key = keys[i];
                    obj[key] = timing[key];
                }
            }
            speed['timing'] = util.mixin({
                'navigationStart' : null,
                'unloadEventStart' : null,
                'unloadEventEnd' : null,
                'redirectStart' : null,
                'redirectEnd' : null,
                'fetchStart' : null,
                'domainLookupStart' : null,
                'domainLookupEnd' : null,
                'connectStart' : null,
                'connectEnd' : null,
                'secureConnectionStart' : null,
                'requestStart' : null,
                'responseStart' : null,
                'responseEnd' : null,
                'domLoading' : null,
                'domInteractive' : null,
                'domContentLoadedStart' : null,
                'domContentLoadedEnd' : null,
                'domComplete' : null,
                'loadEventStart' : null,
                'loadEventEnd' : null,
                'pasteInstanceStart' : pasteInstanceStart,
                'pasteSpeedStart' : timing.legacyNavigationStart,
                'pasteSpeedEnd' : new Date().getTime()
            }, obj, true);

            // normalize browser apis
            speed.timing.domContentLoadedStart = timing.domContentLoadedStart || timing.domContentLoadedEventStart || null;
            speed.timing.domContentLoadedEnd = timing.domContentLoadedEnd || timing.domContentLoadedEventEnd || timing.domContentLoaded || null;

            if (util.hasMethod(navigation, 'hasOwnProperty')) {
                obj = navigation;
            } else {
                keys = Object.keys(navigation);
                len = keys.length;
                obj = {};
                for (i = 0; i < len; i += 1) {
                    key = keys[i];
                    obj[key] = navigation[key];
                }
            }
            speed['navigation'] = util.mixin({
                type : null,
                redirectCount : null,
                TYPE_NAVIGATE : util.isNumber(navigation.TYPE_NAVIGATE) ? navigation.TYPE_NAVIGATE : null,
                TYPE_RELOAD : util.isNumber(navigation.TYPE_RELOAD) ? navigation.TYPE_RELOAD : null,
                TYPE_BACK_FORWARD : util.isNumber(navigation.TYPE_BACK_FORWARD) ? navigation.TYPE_BACK_FORWARD : null,
                TYPE_RESERVED : util.isNumber(navigation.TYPE_RESERVED) ? navigation.TYPE_RESERVED : null
            }, obj, true);

            speed['userAgent'] = w.navigator.userAgent || '';

            onCompleteEvent.fire({
                'page' : speed.page,
                'timing' : speed.timing,
                'navigation' : speed.navigation,
                'userAgent' : speed.userAgent
            });

            w.clearTimeout(completePostTimeout);
            completePostTimeout = null;

            // this should aways be defined since this is a callback
            if (util.hasMethod(windowLoadSub, 'remove')) {
                windowLoadSub.remove();
            }
            windowLoadSub = null;
        },
        windowLoadSub = new event.DocumentEvent.loaded(function () {
            completePostTimeout = w.setTimeout(onWindowLoaded, 0);
        });

    timing['legacyNavigationStart'] = new Date().getTime();

    speed['event'] = {
        'complete' : onCompleteEvent
    };
});