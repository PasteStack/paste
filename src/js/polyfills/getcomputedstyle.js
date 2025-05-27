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