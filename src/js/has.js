/*jslint white:false plusplus:false browser:true nomen:false */
/*globals Globals, paste */

/**
 * Tests a browser for feature support.
 *
 * @requires paste
 * @module paste/has
 */

paste.define(
    'paste.has',
    [],
    function (featuredetection) {
        'use strict';

        var supports3d = null;

        /**
         * @function module:paste/featuredetection.touch
         * @static
         *
         * @return {Boolean}
         */
        featuredetection.touch = (function () {
            return (('ontouchstart' in window) || (window['DocumentTouch'] && document instanceof DocumentTouch));
        }());

        /**
         * @function module:paste/featuredetection.threeDTransforms
         * @static
         *
         * @return {Boolean}
         */
        featuredetection.check3d = function has3d() {
            if (supports3d !== null) {
                return supports3d;
            }

            var el = document.createElement('p'),
                t,
                transforms = {
                    'webkitTransform': '-webkit-transform',
                    'OTransform': '-o-transform',
                    'msTransform': '-ms-transform', // IE's capitalization is non-standard
                    'MozTransform': '-moz-transform',
                    'transform': 'transform'
                };

            // Add it to the body to get the computed style.
            document.body.insertBefore(el, null);

            for (t in transforms) {
                if (el.style[t] !== undefined) {
                    el.style[t] = "translate3d(1px,1px,1px)";
                    supports3d = window.getComputedStyle(el, null).getPropertyValue(transforms[t]);
                }
            }

            document.body.removeChild(el);

            return (supports3d && supports3d.length > 0 && supports3d !== "none");
        };

        /**
         * @function module:paste/featuredetection.pushState
         * @static
         *
         * @return {Boolean}
         */
        featuredetection.pushState = (function () {
            return (typeof history.pushState === "function");
        }());

        /**
         * @function module:paste/featuredetection.placeholder
         * @static
         *
         * @return {Boolean}
         */
        featuredetection.placeholder = (function () {
            var input = document.createElement("input");
            return input.placeholder !== 'undefined';
        }());

        /**
         * @function module:paste/featuredetection.formValidation
         * @static
         *
         * @return {Boolean}
         */
        featuredetection.formValidation = (function () {
            return (typeof document.createElement('input').checkValidity === 'function');
        }());

    }
);
