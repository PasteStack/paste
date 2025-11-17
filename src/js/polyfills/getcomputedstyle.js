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
 * Polyfill Module
 *
 * @requires paste
 * @module polyfills/getcomputedstyle
 *
 */

paste.define('polyfills.getcomputedstyle', function () {
    // http://jsfiddle.net/lauckness/Veukg/

    if (!window.getComputedStyle) {
        var CSS_PROP_EXPR = /(\-([a-z]){1})/g,
        PIXEL = /^[\.\d]+(px)?$/i,
        CONTAINS_NUMBER = /^-?\d/,
        _getPixelValue = function(target, value) {
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

        window.getComputedStyle = function(element, pseudoElt) {
            this.getPropertyValue = function(propertyName) {
                if (propertyName == 'float') {
                    propertyName = 'styleFloat';
                }
                if (CSS_PROP_EXPR.test(propertyName)) {
                    propertyName = propertyName.replace(CSS_PROP_EXPR, function() {
                        return arguments[2].toUpperCase();
                    });
                }
                return element.currentStyle[propertyName] ? _getPixelValue (element, element.currentStyle[propertyName]) : null;
            };
            return this;
        };
    }
});