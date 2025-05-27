/*jslint white:false plusplus:false browser:true nomen:false sub:true */
/*globals Globals, paste, google */

/** *
 * @requires paste
 * @requires paste/event
 * @module paste/ui/tv/mediator
 */

paste['define'](
    'paste.ui.tv.mediator',
    [
        'paste.event'
    ],
    function (module, event) {
        'use strict';
        var $Event = event['Event'],
            keyCode,
            goBackRequestEvent = new $Event(),
            navForwardRequestEvent = new $Event(),
            navBackRequestEvent = new $Event(),
            selectionRequestEvent = new $Event(),
            navDownRequestEvent = new $Event(),
            userDataReadyEvent = new $Event(),
            tvUIDataReadyEvent = new $Event(),
            tvUIDetailDataReadyEvent = new $Event(),
            tvUIBoundsHitEvent = new $Event(),
            tvUIActiveIndexChangeEvent = new $Event(),
            tvUIInitializedEvent = new $Event(),
            tvUIDisposedEvent = new $Event(),
            tvUIActiveIndexCompleteEvent = new $Event(),
            tvUIResizeEvent = new $Event(),
            routeResolveBegin = new $Event(),
            routeResolveEnd = new $Event(),
            genericLoadStartEvent = new $Event(),
            genericLoadEndEvent = new $Event(),
            genericIndexChangeEvent = new $Event(),
        // todo - add more state checking to this. detecting a "press" isn't as straightforward as "down"
            keyDownHandler = function (e, data) {
                e.preventDefault();

                keyCode = e.keyCode;
                switch (keyCode) {
                    // forward
                    case 39: // right arrow
                    case 9: // tab
                        navForwardRequestEvent['fire']();
                        break;

                    // escape (go back)
                    case 38: // up arrow
                    case 27: // esc
                        goBackRequestEvent['fire']();
                        break;

                    case 37: // left arrow
                        navBackRequestEvent['fire']();
                        break;

                    case 13: // enter
                        selectionRequestEvent['fire']();
                        break;

                    case 40: // down
                        navDownRequestEvent['fire']();
                        break;

                    default:
                        break;
                }
            },
            keyDownSubscription = event['bind']('keydown', window, keyDownHandler),
            resizeHandler = function (e, data) {
                tvUIResizeEvent['fire']();
            },
            resizeEvent = new event['bind']('resize', window, resizeHandler);

        return {
            'genericLoadStartEvent': genericLoadStartEvent,
            'genericLoadEndEvent': genericLoadEndEvent,
            'goBackRequestEvent': goBackRequestEvent,
            'navForwardRequestEvent': navForwardRequestEvent,
            'navBackRequestEvent': navBackRequestEvent,
            'navDownRequestEvent': navDownRequestEvent,
            'selectionRequestEvent': selectionRequestEvent,
            'tvUIActiveIndexChangeEvent': tvUIActiveIndexChangeEvent,
            'tvUIInitializedEvent': tvUIInitializedEvent,
            'tvUIDisposedEvent': tvUIDisposedEvent,
            'tvUIActiveIndexCompleteEvent': tvUIActiveIndexCompleteEvent,
            'userDataReadyEvent': userDataReadyEvent,
            'tvUIDataReadyEvent': tvUIDataReadyEvent,
            'tvUIDetailDataReadyEvent': tvUIDetailDataReadyEvent,
            'tvUIBoundsHitEvent': tvUIBoundsHitEvent,
            'tvUIResizeEvent': tvUIResizeEvent,
            'routeResolveBegin': routeResolveBegin,
            'routeResolveEnd': routeResolveEnd,
            'genericIndexChangeEvent': genericIndexChangeEvent
        }
    }
);
