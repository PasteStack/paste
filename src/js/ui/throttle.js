/**
 * @module paste/ui/throttle
 */

paste.define(
    'paste.ui.throttle',
    [],
    function (throttle) {
        'use strict';
        var activeThrottles = {};

        throttle = function(fn, period, id, runFirst) {
            return function() {
                var context, theseArguments;

                id = id || fn['toString']() + period['toString']();

                if(!activeThrottles[id]) {
                    if(runFirst) {
                        fn['apply'](this, arguments);
                    }
                    else {
                        context = this;
                        theseArguments = arguments;
                    }
                    activeThrottles[id] = setTimeout(function(){
                        if(!runFirst) {
                            fn['apply'](context, theseArguments);
                        }
                        delete activeThrottles[id];
                    }, period);                
                }
            };
        };
    }
);
