/**
 * @requires paste/util
 * @requires paste/dom
 * @requires paste/io
 * @module paste/ui/widget/lazy_loader
 */

paste.define(
    'paste.ui.widget.lazy_loader',
    [
        'paste.util',
        'paste.dom',
        'paste.io'
    ],
    function (module, util, dom, io) {
        'use strict';
        var LAZY_LOAD_HREF_ATTR = 'data-lazy-load',
            init_new_content = function(){},
            load_all_content = function($parent) {
                util.each(dom.querySelectorAll('*['+LAZY_LOAD_HREF_ATTR+']',$parent),load_lazy_content);
            },
            load_visible_content = function($parent) {
                util.each(dom.querySelectorAll('*['+LAZY_LOAD_HREF_ATTR+']',$parent),function($el){
                    if( $el.offsetWidth > 0 && $el.offsetHeight > 0 ) {
                        load_lazy_content($el);
                    }
                });
            },
            load_lazy_content = function($el) {
                io.get($el.getAttribute(LAZY_LOAD_HREF_ATTR),'',function(response){
                    $el.innerHTML = response;
                    $el.removeAttribute(LAZY_LOAD_HREF_ATTR)
                    if( init_new_content.call && typeof init_new_content.call == "function" ) {
                        init_new_content.call($el,$el);
                    }
                });
            },
            set_init_new_content = function(new_fn) {
                init_new_content = new_fn;
            };

        module['set_init_new_content'] = set_init_new_content;
        module['load_all_content'] = load_all_content;
        module['load_visible_content'] = load_visible_content;
        module['load_lazy_content'] = load_lazy_content;
    }
);
