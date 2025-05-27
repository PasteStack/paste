/**
 * @requires paste/dom
 * @requires paste/event
 * @requires paste/util
 * @requires paste/guid
 * @module paste/ui/form/plus/js_tooltip
 */

paste.define(
    'paste.ui.form.plus.js_tooltip',
    [
        'paste.dom',
        'paste.event',
        'paste.util',
        'paste.guid'
    ],
    function (js_tooltip_module, dom, event, util, guid, undefined) {
        'use strict';

        var TOOLTIP_DATA_ATTR = "data-ui-js-tooltip",
            TOOLTIP_FLYOUT_CLASS = "ui-js-tooltip",
            mouseoverSubscriptions = {},
            mouseoutSubscriptions = {},
            init,
            getAndSetId,
            tooltipIdFromElementId,
            mouseoverCallback,
            mouseoutCallback,
            findElementOffset;

        getAndSetId = function($el) {
            var id = $el['id'] || guid['Guid']['create']();

            if( !$el['id'] ) {
                $el['id'] = id;
            }

            return id;
        };

        tooltipIdFromElementId = function(id) {
            return id + "__TOOLTIP";
        };

        findElementOffset = function($el) {
            var runningTop = 0,
                runningLeft = 0;

            while($el && $el['tagName']['toLowerCase']()!=='body') {
                runningLeft += $el.offsetLeft;
                runningTop += $el.offsetTop;
                $el = $el.offsetParent;
            }

            return {
                'left': runningLeft,
                'top': runningTop
            }
        };

        mouseoverCallback = function(e) {
            var $el = event['getEventTarget'](e),
                $tooltip = document['createElement']('div'),
                tooltipId = tooltipIdFromElementId($el['id']),
                tooltipAttr = $el['getAttribute'](TOOLTIP_DATA_ATTR),
                elTop,
                elLeft,
                body = document['body'],
                offset;

            if(document['getElementById'](tooltipId)) {
                return;
            }

            if(!tooltipAttr) {
                return;
            }

            if(e.offsetY && e.offsetX) {
                elTop = e.pageY - e.offsetY;
                elLeft = e.pageX - e.offsetX;
            }
            else {
                offset = findElementOffset($el);
                elTop = offset['top'];
                elLeft = offset['left'];
            }

            $tooltip['id'] = tooltipId;
            $tooltip['className'] = TOOLTIP_FLYOUT_CLASS;

            util['each'](tooltipAttr['split']('|'),function(part) {
                var parts = part['split']('='),
                    $part;

                if(parts.length == 2) {
                    $part = document['createElement']('div');
                    $part['className'] = parts[0];
                    $part['innerHTML'] = parts[1];
                    $tooltip['appendChild']($part);
                }
            });

            $tooltip['style']['right'] = (body['offsetWidth'] - (elLeft + $el['offsetWidth']/2)) + "px";
            $tooltip['style']['bottom'] = (body['offsetHeight'] - elTop) + "px";

            body['appendChild']($tooltip);

        };

        mouseoutCallback = function(e) {
            var $el = event['getEventTarget'](e),
                $tooltip = document['getElementById'](tooltipIdFromElementId($el['id']));

            if($tooltip) {
                $tooltip.parentNode.removeChild($tooltip);
            }
        };

        init = function($parent) {
            util['each'](dom['querySelectorAll']("*["+TOOLTIP_DATA_ATTR+"]", $parent || document), function($el) {
                var id = getAndSetId($el);

                if(!mouseoverSubscriptions[id]) {
                    mouseoverSubscriptions[id] = event['bind']('mouseover', $el, mouseoverCallback);
                }

                if(!mouseoutSubscriptions[id]) {
                    mouseoutSubscriptions[id] = event['bind']('mouseout', $el, mouseoutCallback);
                }
            });
        }

        js_tooltip_module['init'] = init;

        init();
    }
);
