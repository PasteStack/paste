/*jslint white:false plusplus:false browser:true nomen:false */
/*globals Globals, paste */

/**
 * Allows elements to sorted via the native drag and drop API.
 *
 * 'Sorting' is achieved by swapping the innerHTML content of the originating drag element with the target element.
 * This plugin does not dictate any mechanism for setting the order of the elements. Instead, it provides two ways
 * to work with the content: a separation of content blocks and draggable content, and a callback API for when elements
 * trigger dragStart, dragEnter, and dragEnd events.
 *
 * There are three markup requirements:
 * - a parent element that provides easy binding for a group of elements and also the context from which children will
 *   be found. The parent element can be any element and is defined in the 'bind' method of this plugin.
 * - sortable blocks classed as 'jb-sortable'. These are wrappers for each block meant to distinguish between groups
 *   of sortable content and content that should be draggable.
 * - draggable content. Content that should be draggable should use the attribute 'draggable="true"'.
 *
 * It's important to note the distinction between the 'blocks' and the 'draggables'; in most cases you will likely want
 * to leave certain structural elements in place (buttons, input fields defining order, headings) while certain content
 * should move, like inputs containing XIDs, custom graphics, text, etc.
 *
 * @requires paste
 * @requires paste/dom
 * @requires paste/util
 * @requires paste/event
 * @requires paste/has
 * @module paste/ui/form/plus/sortable
 */
paste.define(
    'paste.ui.form.plus.sortable',
    [
        'paste.dom',
        'paste.util',
        'paste.event',
        'paste.has'
    ],
    function (sortable, dom, util, event, has) {
        'use strict';

        var ie = has.ie(),// sniffing user agent is bad, but no great way around it in this case
            stop = function (e) {
                if (e.stopPropagation) {
                    e.stopPropagation();
                }
            },
            cancel = function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }
                return false;
            },
            Sortable = function ($parent, callbacks) {

                var self = this,
                    dragSrcEl = null,
                    BLOCK_SELECTOR = ".jb-sortable",
                    DRAGGABLE_CONTENT_SELECTOR = "[draggable=true]",
                    NO_DRAG_SUPPORT_CLASS = "no-drag",
                    DRAGGING_CLASS = 'dragging',
                    OVER_CLASS = 'over';

                this.$parent = $parent;
                this.$blocks = dom.querySelectorAll(BLOCK_SELECTOR, $parent);
                this.$draggables = dom.querySelectorAll(DRAGGABLE_CONTENT_SELECTOR, $parent);
                this.dragStartEvents = [];
                this.dragEnterEvents = [];
                this.dragOverEvents = [];
                this.dragLeaveEvents = [];
                this.dropEvents = [];
                this.dragEndEvents = [];
                this.ieDragEvents = [];
                this.customDragStart = [];
                this.customDragEnter = [];
                this.customDragEnd = [];

                this.init = function () {

                    var self = this;

                    util.each(self.$blocks, function (block, index) {

                        var draggable = self.$draggables[index] || false;

                        if (!draggable) {
                            throw new Error("no draggable content found. Add 'draggable=true' to draggable content.");
                        }

                        self.dragStartEvents.push(new event.Event(draggable, 'dragstart'));
                        self.dragStartEvents[index].subscribe(self.dragStart);

                        self.dragEnterEvents.push(new event.Event(draggable, 'dragenter'));
                        self.dragEnterEvents[index].subscribe(self.dragEnter);

                        self.dragOverEvents.push(new event.Event(draggable, 'dragover'));
                        self.dragOverEvents[index].subscribe(self.dragOver);

                        self.dragLeaveEvents.push(new event.Event(draggable, 'dragleave'));
                        self.dragLeaveEvents[index].subscribe(self.dragLeave);

                        self.dropEvents.push(new event.Event(draggable, 'drop'));
                        self.dropEvents[index].subscribe(self.drop);

                        self.dragEndEvents.push(new event.Event(draggable, 'dragend'));
                        self.dragEndEvents[index].subscribe(self.dragEnd);

                        // ♥ you, IE 9
                        if (ie === 9) {
                            self.ieDragEvents.push(new event.Event(draggable, 'selectstart'));
                            self.ieDragEvents[index].subscribe(self.ieDrag);
                        }

                        // † you, IE 8
                        if (ie === 8) {
                            dom.addCssClass($parent, NO_DRAG_SUPPORT_CLASS);
                        }

                        // provide an easier api for custom callbacks
                        if (callbacks.dragStart && typeof callbacks.dragStart === "function") {
                            self.customDragStart.push(new event.Event(draggable, 'dragstart'));
                            self.customDragStart[index].subscribe(function () {
                                // passing 'self' probably wouldn't be very useful; passing els that might be
                                callbacks.dragStart.call(this, self.$parent, block);
                            });
                        }

                        if (callbacks.dragEnter && typeof callbacks.dragEnter === "function") {
                            self.customDragEnter.push(new event.Event(draggable, 'dragenter'));
                            self.customDragEnter[index].subscribe(function () {
                                // passing 'self' probably wouldn't be very useful; passing els that might be
                                callbacks.dragEnter.call(this, self.$parent, block);
                            });
                        }

                        if (callbacks.dragEnd && typeof callbacks.dragEnd === "function") {
                            self.customDragEnd.push(new event.Event(draggable, 'dragend'));
                            self.customDragEnd[index].subscribe(function () {
                                // passing 'self' probably wouldn't be very useful; passing els that might be
                                callbacks.dragEnd.call(this, self.$parent, block);
                            });
                        }
                    });
                };

                this.dragStart = function (e) {
                    dom.addCssClass(this, DRAGGING_CLASS);

                    dragSrcEl = this;

                    e.dataTransfer.effectAllowed = 'move';

                    // Must use data type "Text" for IE
                    e.dataTransfer.setData('Text', this.innerHTML);
                };

                this.dragOver = function (e) {
                    cancel(e);

                    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

                    return false;
                };

                this.dragEnter = function (e) {
                    dom.addCssClass(this, OVER_CLASS);
                };

                this.dragLeave = function (e) {
                    dom.removeCssClass(this, OVER_CLASS);
                };

                this.drop = function (e) {
                    stop(e);

                    // Firefox needs this
                    cancel(e);

                    // Don't do anything if dropping the same column we're dragging.
                    if (dragSrcEl !== this) {

                        // Set the source column's HTML to the HTML of the column we dropped on.
                        dragSrcEl.innerHTML = this.innerHTML;

                        // Must use data type "Text" for IE
                        this.innerHTML = e.dataTransfer.getData('Text');
                    }

                    return false;
                };

                this.dragEnd = function (e) {
                    dom.removeCssClass(this, DRAGGING_CLASS);

                    util.each(self.$draggables, function (draggable) {
                        dom.removeCssClass(draggable, OVER_CLASS);
                    });
                };

                this.ieDrag = function (e) {
                    // we have to call a proprietary method for IE 9
                    this.dragDrop();
                    return false;
                };

                // Go!
                this.init();
            };


        /**
         * An API for binding a collection of sortable objects
         *
         * @function module:paste/ui/sortable.bind
         * @static
         *
         * @param {(string|object)} $parentEl - A selector or node of the parent element
         * @param {object} [callbacks] - Optional object of callbacks for dragStart, dragEnter, dragEnd
         */

        sortable.bind = function ($parentEl, callbacks) {
            if (typeof $parentEl === "string") {
                // if we're passed a string, we assume it's a selector
                $parentEl = dom.get($parentEl, true)[0];
            }

            if ($parentEl && $parentEl.nodeName) {
                return new Sortable($parentEl, callbacks);
            } else {
                throw new Error("invalid parent element.");
            }
        };
    }
);
