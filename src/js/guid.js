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
