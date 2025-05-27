/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * Polyfill Module
 *
 * @requires paste
 * @module polyfills/performance
 *
 */

paste.define('polyfills.performance', function () {
    if (!window.performance) {
        window.performance = function (){};
    }
});