/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste, localStorage */
/**
 * The paste.js storage module. This wraps local storage is support is available; Performance of window.localStorage is not very fast or consistent across browsers. Use with caution.
 *
 * @requires paste
 * @module paste/storage
 */
paste.define('paste.storage', function (storage) {
    /**
     * @function module:paste/storage~_hasSupport
     * @return {Boolean}
     * @internal
     */
    var _hasSupport = function () {
            try {
                return ('localStorage' in window) && (window.localStorage !== null);
            } catch (e) {
                return false;
            }
        },
        /**
         * @const module:paste/storage~_CACHE_THRESHOLD
         * @type {Number}
         * @internal
         */
            _CACHE_THRESHOLD = 1024 * 1024;

    /**
     * @function module:paste/storage.get
     * @param key
     * @return {String}
     */
    storage.get = function (key) {
        var value = null;
        if (_hasSupport()) {
            value = localStorage[key];
        }
        return value;
    };

    /**
     * @function module:paste/storage.set
     * @param key
     * @param value
     * @return {Boolean}
     */
    storage.set = function (key, value) {
        if (_hasSupport()) {
            localStorage[key] = value;
            return true;
        }
        return false;
    };

    /**
     * @function module:paste/storage.remove
     * @param key
     * @return {Boolean}
     */
    storage.remove = function (key) {
        if (_hasSupport()) {
            localStorage.removeItem(key);
            return true;
        }
        return false;
    };

    /**
     * @function module:paste/storage.removeAll
     */
    storage.removeAll = function () {
        if (_hasSupport()) {
            localStorage.clear();
        }
    };

    /**
     * @function module:paste/storage.checkCache
     */
    storage.checkCache = function () {
        if (_hasSupport()) {
            window.setTimeout(function () {
                var key, parts, purge, oldest = Date.now(), total = 0, localStorageKeys = Object.keys(localStorage), length = localStorageKeys.length, i = 0;
                for (i; i < length; i += 1) {
                    key = localStorage[localStorageKeys[i]];

                    if (key.substring(0, 6) === 'cache_') {
                        parts = localStorage[key].split('_');
                        total += parseInt(parts[1], 10);
                        if (parts[0] < oldest) {
                            oldest = parts[0];
                            purge = key.substring(6);
                        }
                    }
                }

                if (total > _CACHE_THRESHOLD) {
                    storage.cacheRemove(purge);
                }
            }, 1000);
        }
    };

    /**
     * @function module:paste/storage.cacheInvalidatePrefix
     * @param {String} prefix
     */
    storage.cacheInvalidatePrefix = function (prefix) {
        if (_hasSupport()) {
            var key, localStorageKeys = Object.keys(localStorage), length = localStorageKeys.length, i = 0;
            for (i; i < length; i += 1) {
                key = localStorage[localStorageKeys[i]];
                if (key.substring(0, prefix.length) === prefix) {
                    storage.cacheInvalidate(key);
                }
            }
        }
    };

    /**
     * @function module:paste/storage.cacheInvalidate
     * @param {String} key
     */
    storage.cacheInvalidate = function (key) {
        if (_hasSupport()) {
            storage.cacheRemove(key);
        }
    };

    /**
     * @function module:paste/storage.cacheRemove
     * @param {String} key
     */
    storage.cacheRemove = function (key) {
        if (_hasSupport()) {
            storage.remove('cache_' + key);
            storage.remove(key);
        }
    };

    /**
     * @function module:paste/storage.cache
     * @param {String} key
     * @param {String} value
     */
    storage.cache = function (key, value) {
        if (_hasSupport()) {
            storage.set('cache_' + key, Date.now() + '_' + value.length);
            storage.set(key, value);
            storage.checkCache();
        }
    };
});