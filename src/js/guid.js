/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * The paste.js guid module. This is provides support create globally unique identifiers
 *
 * @requires paste
 * @module paste/guid
 */
paste.define('paste.guid', function (guid) {
    'use strict';

    /**
     * @class module:paste.guid.Guid
     * @return {String}
     * @constructor
     * @static
     */
    guid.Guid = function () {

        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };

        /*jslint bitwise:true */
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    };

    /**
     * @function module:paste.guid.Guid.create
     * @return {String}
     */
    guid.Guid.create = function () {
        return guid.Guid();  // creates a basic uuid
    };
});
