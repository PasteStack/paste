/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * The paste.js dom module. This is provides utility methods for manipulating and reading the dom.
 *
 * @requires paste
 * @module paste/lru
 */
paste.define(
    'paste.lru',
    [
    ],
    function (lru) {
        'use strict';

// ****************************************************************************
// lru.Cache constructor
// Creates a new cache object
// INPUT: maxSize (optional) - indicates how many items the cache can hold.
//                             default is -1, which means no limit on the
//                             number of items.
        lru.Cache = function (options) {
            this.items = null;
            this.count = 0;
            if (!options || options.maxSize == null) {
                this.maxSize = -1;
            } else {
                this.maxSize = options.maxSize;
            }

            this.fillFactor = .75;
            this.purgeSize = Math.round(this.maxSize * this.fillFactor);

            this.stats = {};
            this.stats.hits = 0;
            this.stats.misses = 0;

            this.options = {};
            this._applyInitialStorageType(options ? options.storageType : null);
        }

        lru.Cache.CachePriority = {
            Low: 1,
            Normal: 2,
            High: 4
        };
        lru.Cache.CacheStorageType = {
            local: 1,
            localStorage: 2,
            sessionStorage: 3,
            cookie: 4
        };
        lru.Cache.CacheStorageTypeRev = {
            1: 'local',
            2: 'localStorage',
            3: 'sessionStorage',
            4: 'cookie'
        };

// ****************************************************************************
// lru.Cache.getItem
// retrieves an item from the cache, returns null if the item doesn't exist
// or it is expired.
// INPUT: key - the key to load from the cache
        lru.Cache.prototype.getItem = function (key) {

            // retrieve the item from the cache
            var item = this.items[key];

            if (item != null) {
                if (!this._isExpired(item)) {
                    // if the item is not expired
                    // update its last accessed date
                    item.lastAccessed = new Date().getTime();
                } else {
                    // if the item is expired, remove it from the cache
                    this._removeItem(key);
                    item = null;
                }
            }

            // return the item value (if it exists), or null
            var returnVal = null;
            if (item != null) {
                returnVal = item.value;
                this.stats.hits++;
            } else {
                this.stats.misses++;
            }
            return returnVal;
        };

        lru.Cache.prototype._overwriteItemsFromWebStorage = function (storageType) {
            setTimeout((function (storageType, itemsDict, CacheStorageTypeRef, CacheStorageTypeRevRef) {
                switch (storageType) {
                    case CacheStorageTypeRef.localStorage:
                    case CacheStorageTypeRef.sessionStorage:
                        var key, webStorage = window[CacheStorageTypeRevRef[storageType]],
                            localStorageKeys = Object.keys(webStorage), length = localStorageKeys.length, i = 0;
                        for (i; i < length; i += 1) {
                            key = localStorageKeys[i];
                            itemsDict[key] = new CacheItem.newInstance(JSON.parse(webStorage[key]));
                        }
                        break;
                    default:
                        break;
                }
            }(storageType, this.items, this.constructor.CacheStorageType, this.constructor.CacheStorageTypeRev)), 4);
        };

        lru.Cache.prototype._applyInitialStorageType = function (storageType) {
            this.items = {};
            switch (storageType) {
                case this.constructor.CacheStorageType.localStorage:
                    if (!(('localStorage' in window) && (window.localStorage !== null))) {
                        throw "Local Storage not supported";
                    }
                    this.options.storageType = storageType;
                    this._overwriteItemsFromWebStorage(storageType, this.items);
                    break;
                case this.constructor.CacheStorageType.sessionStorage:
                    if (!(('sessionStorage' in window) && (window.sessionStorage !== null))) {
                        throw "Session Storage not supported";
                    }
                    this.options.storageType = storageType;
                    this._overwriteItemsFromWebStorage(storageType, this.items);
                    break;
                case this.constructor.CacheStorageType.cookie:
                    throw 'cookie unsported';
                case this.constructor.CacheStorageType.local:
                default:
                    this.options.storageType = storageType;
                    break;
            }


        };

        function CacheItem(k, v, o, la) {
            if ((k == null) || (k == ''))
                throw new Error("key cannot be null or empty");
            this.key = k;
            this.value = v;
            if (o == null)
                o = {};
            if (o.expirationAbsolute != null)
                o.expirationAbsolute = o.expirationAbsolute.getTime();
            if (o.priority == null)
                o.priority = lru.Cache.CachePriority.Normal;
            this.options = o;
            this.lastAccessed = la || new Date().getTime();
        }

        CacheItem.prototype.serialize = function () {
            return {
                'key': this.key,
                'value': this.value,
                'options': this.options,
                'lastAccessed': this.lastAccessed
            }
        };

        CacheItem.newInstance = function (serializedCacheItem) {
            return new CacheItem(
                serializedCacheItem.key,
                serializedCacheItem.value,
                serializedCacheItem.options,
                serializedCacheItem.lastAccessed ? new Date(serializedCacheItem.lastAccessed) : null
            );
        };


// ****************************************************************************
// lru.Cache.setItem
// sets an item in the cache
// parameters: key - the key to refer to the object
//             value - the object to cache
//             options - an optional parameter described below
// the last parameter accepts an object which controls various caching options:
//      expirationAbsolute: the datetime when the item should expire
//      expirationSliding: an integer representing the seconds since
//                         the last cache access after which the item
//                         should expire
//      priority: How important it is to leave this item in the cache.
//                You can use the values CachePriority.Low, .Normal, or
//                .High, or you can just use an integer.  Note that
//                placing a priority on an item does not guarantee
//                it will remain in cache.  It can still be purged if
//                an expiration is hit, or if the cache is full.
//      callback: A function that gets called when the item is purged
//                from cache.  The key and value of the removed item
//                are passed as parameters to the callback function.

        lru.Cache.prototype.setItem = function (key, value, options) {
            // add a new cache item to the cache
            if (this.items[key] != null)
                this._removeItem(key);
            this._addItem(new CacheItem(key, value, options));

            // if the cache is full, purge it
            if ((this.maxSize > 0) && (this.count > this.maxSize)) {
                this._purge();
            }
        };

// ****************************************************************************
// lru.Cache.clear
// Remove all items from the cache
        lru.Cache.prototype.clear = function () {

            // loop through each item in the cache and remove it
            for (var key in this.items) {
                this._removeItem(key);
            }
        };

// ****************************************************************************
// lru.Cache._purge (PRIVATE FUNCTION)
// remove old elements from the cache
        lru.Cache.prototype._purge = function () {

            var tmparray = new Array();

            // loop through the cache, expire items that should be expired
            // otherwise, add the item to an array
            for (var key in this.items) {
                var item = this.items[key];
                if (this._isExpired(item)) {
                    this._removeItem(key);
                } else {
                    tmparray.push(item);
                }
            }

            if (tmparray.length > this.purgeSize) {

                // sort this array based on cache priority and the last accessed date
                tmparray = tmparray.sort(function (a, b) {
                    if (a.options.priority != b.options.priority) {
                        return b.options.priority - a.options.priority;
                    } else {
                        return b.lastAccessed - a.lastAccessed;
                    }
                });

                // remove items from the end of the array
                while (tmparray.length > this.purgeSize) {
                    var ritem = tmparray.pop();
                    this._removeItem(ritem.key);
                }
            }
        };

// ****************************************************************************
// lru.Cache._addItem (PRIVATE FUNCTION)
// add an item to the cache
        lru.Cache.prototype._addItem = function (item) {
            this.items[item.key] = item;
            this.count++;

            if (this.options.storageType && this.options.storageType > 1) {
                setTimeout((function (storageType, itemKey, serializedItem, CacheStorageTypeRef, CacheStorageTypeRevRef) {
                    switch (storageType) {
                        case CacheStorageTypeRef.localStorage:
                        case CacheStorageTypeRef.sessionStorage:
                            window[CacheStorageTypeRevRef[storageType]].setItem(itemKey, JSON.stringify(serializedItem));
                            break;
                        default:
                            break;
                    }
                }(this.options.storageType, item.key, item.serialize(), this.constructor.CacheStorageType, this.constructor.CacheStorageTypeRev)), 4);
            }

        };

// ****************************************************************************
// lru.Cache._removeItem (PRIVATE FUNCTION)
// Remove an item from the cache, call the callback function (if necessary)
        lru.Cache.prototype._removeItem = function (key) {
            var item = this.items[key];
            delete this.items[key];

            if (this.options.storageType && this.options.storageType > 1) {
                setTimeout((function (storageType, itemKey, CacheStorageTypeRef, CacheStorageTypeRevRef) {
                    switch (storageType) {
                        case CacheStorageTypeRef.localStorage:
                        case CacheStorageTypeRef.sessionStorage:
                            window[CacheStorageTypeRevRef[storageType]].removeItem(itemKey);
                            break;
                        default:
                            break;
                    }
                }(this.options.storageType, key, this.constructor.CacheStorageType, this.constructor.CacheStorageTypeRev)), 4);
            }

            this.count--;

            // if there is a callback function, call it at the end of execution
            if (item.options.callback != null) {
                var callback = function () {
                    item.options.callback(item.key, item.value);
                };
                setTimeout(callback, 0);
            }
        };

// ****************************************************************************
// lru.Cache._isExpired (PRIVATE FUNCTION)
// Returns true if the item should be expired based on its expiration options
        lru.Cache.prototype._isExpired = function (item) {
            var now = new Date().getTime();
            var expired = false;
            if ((item.options.expirationAbsolute) && (item.options.expirationAbsolute < now)) {
                // if the absolute expiration has passed, expire the item
                expired = true;
            }
            if (!expired && (item.options.expirationSliding)) {
                // if the sliding expiration has passed, expire the item
                var lastAccess = item.lastAccessed + (item.options.expirationSliding * 1000);
                if (lastAccess < now) {
                    expired = true;
                }
            }
            return expired;
        };

        lru.Cache.prototype.toHtmlString = function () {
            var returnStr = this.count + " item(s) in cache<br /><ul>";
            for (var key in this.items) {
                var item = this.items[key];
                returnStr = returnStr + "<li>" + item.key.toString() + " = " + item.value.toString() + "</li>";
            }
            returnStr = returnStr + "</ul>";
            return returnStr;
        };
    });

