/**
 * @requires paste/util
 * @requires paste/event
 * @requires paste/dom
 * @module paste/ui/widget/unsupported_widget
 */

paste.define(
    'paste.ui.widget.unsupported_widget',
    [
        'paste.util',
        'paste.event',
        'paste.dom'
    ],
    function (module, util, event, dom) {
        'use strict';
        var UNSUPPORTED_widget_ID = "unsupported-widget",
            OPEN_CLASS = "open",
            CLOSE_ON_CLICK_CLASSES = ["close","background"],
            $unsupported_widget = document.getElementById(UNSUPPORTED_widget_ID),
            close_click_handler = function() {
                dom['removeCssClass']($unsupported_widget,OPEN_CLASS);
            };

        util['each'](CLOSE_ON_CLICK_CLASSES,function(class_name){
            util['each'](dom['querySelectorAll']("."+class_name,$unsupported_widget),function($el){
                new event.Event.Subscription('click',$el,close_click_handler);
            });
        });
    }
);
