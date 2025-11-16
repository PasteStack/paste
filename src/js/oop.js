/*jslint white:false plusplus:false browser:true nomen:false */
/*globals paste */

/**
 * The paste.js oop module. This is provides support for all things OOP, namely classical inheritance (see {@link module:paste/oop.Class.create} for classical inheritance).
 *
 * @requires paste
 * @module paste/oop
 */
paste.define('paste.oop', function (oop) {
    'use strict';

    var _memberName,
        _scopeDefault,
        _ScopeProxy = function (context, memberName, proxyPrototypeMember) {
            this[memberName] = (function (context, superFunc) {
                return function () {
                    return superFunc.apply(context, arguments);
                };
            }(context, proxyPrototypeMember));
        },
        _scopeFunc,
        _makeScopeFunc = function (memberName, func, proxyPrototypeMember) {
            return function () {
                _scopeDefault = this.base;
                this.base = new _ScopeProxy(this, memberName, proxyPrototypeMember);
                _scopeFunc = func.apply(this, arguments);
                this.base = _scopeDefault;
                return _scopeFunc;
            };
        };

    /**
     *Create a new paste.oop.Class. This is the basis for creating an extendible class definition. See {@link module:paste/oop.Class.create} and {@link module:paste/oop.Class.extend} for correct usage.
     *
     * @class module:paste/oop.Class
     */
    oop.Class = function () {
    };

    /**
     *
     * @function module:paste/oop.Class.create
     * @param members
     * @return {module:paste/oop.Class}
     *
     * @example
     * var MyClassDef = oop.Class.create({
     *     init:function (param) {
     *          this.prop = param;
     *     }
     * });
     * MyClassDef.prototype.dispose = function () {
     *      delete this.prop;
     * };
     * MyClassDef.bind = function (param) {
     *      return new MyClassDef(param);
     * }
     */
    oop.Class.create = function (members) {
        return oop.Class.extend(members);
    };

    /**
     * @function module:paste/oop.Class.extend
     * @param members
     * @return {module:paste/oop.Class}
     * @example
     * var MySubClassDef = MyClassDef.extend({
     *     init : function () {
     *          this.base.init('value');
     *     },
     *     dispose : function () {
     *          delete this._lazyProp;
     *          this.base.dispose();
     *     }
     * });
     * MySubClassDef.prototype.getLazyProp = function () {
     *      if (!this._lazyProp) {
     *          this._lazyProp = 'value';
     *      }
     *
     *      return this._lazyProp;
     * };
     * MySubClassDef.bind = function () {
     *      return new MySubClassDef();
     * }
     */
    oop.Class.extend = function (members) {
        function Class () {
            if (this.init) {
                this.init.apply(this, arguments);
            }
        }

        var SuperClassProxy = function () {
        }, _super = SuperClassProxy.prototype = this.prototype;

        Class.prototype = new SuperClassProxy();
        Class.prototype.constructor = Class;

        for (_memberName in members) {
            if (members.hasOwnProperty(_memberName)) {
                Class.prototype[_memberName] = (typeof members[_memberName] === 'function' && typeof SuperClassProxy.prototype[_memberName] === 'function') ? _makeScopeFunc(_memberName, members[_memberName], SuperClassProxy.prototype[_memberName]) : members[_memberName];
            }
        }

        Class.extend = oop.Class.extend;

        _super = null;
        return Class;
    };
});