/*jslint white:false plusplus:false browser:true nomen:false sub:true*/
/*globals paste, DocumentTouch*/


/**
 * @compilation_level ADVANCED_OPTIMIZATIONS
 *
 * Description
 *
 * @requires paste
 * @requires paste/guid
 * @requires paste/util
 * @requires paste/dom
 * @requires paste/event
 * @requires polyfills/getcomputedstyle
 * @module paste/ui/heroscroll
 */

paste['define'](
    'paste.ui.heroscroll',
    [
        'paste.guid',
        'paste.util',
        'paste.dom',
        'paste.event',
        'polyfills.getcomputedstyle'
    ],
    function (heroscroll, guid, util, dom, event, _) {
        'use strict';


        var html = dom['getDocumentBody'](),
            body = document.getElementsByTagName('body')[0],
            OVERRIDE_IMAGE_HEIGHT_FLAG = 'force-full-height',
            HERO_CLASS = 'paste-ui-hero',
            HERO_TOUCH_CLASS = HERO_CLASS + '-touch',
            HERO_IMAGE_CLASS = HERO_CLASS + '-image',
            HERO_CONTENT_CLASS = HERO_CLASS + '-content',


            // this isn't the best touch detection, but it serves our purposes here
            touchSupported = (function() {
                return (('ontouchstart' in window) || (window['DocumentTouch'] && document instanceof DocumentTouch));
            }()),


            backgroundSizeSupported = (function () {
                var undef;
                return document.body.style['backgroundSize'] !== undef;
            }()),




            opacitySupported = (function () {
                var undef;
                return document.body.style['opacity'] !== undef;
            }()),




            /*
             * OPACITY ANIMATION
             */
            setOpacity = function (element, value) {
                if (opacitySupported) {
                    element.style.opacity = value / 100;
                } else {
                    element.style.filter = 'alpha(opacity=' + value + ')';
                }
            },
            $transitionOpacityInterval,
            $transitionOpacityFunc = function (element, value) {
                $transitionOpacityInterval = window.setTimeout((function (element, value) {
                    return function () {
                        window.clearTimeout($transitionOpacityInterval);
                        $transitionOpacityInterval = null;
                        setOpacity(element, value);
                    };
                }(element, value)), value * 10);
            },
            transitionOpacity = function (element, start, end) {
                setOpacity(element, start);
                var i, len = end;
                for (i = 1; i <= len; i += 1) {
                    $transitionOpacityFunc(element, i);
                }


                return end;
            },




            /*
             * HERO MODULE CLICK
             */
            $heroIdChange,
            dispatchHeroIdChange = function (heroId) {
                $heroIdChange = new event['Event'](window, 'hashchange');
                $heroIdChange['fire']({
                    'newURL' : heroId,
                    'updateHash' : false
                });
                $heroIdChange['dispose']();
                $heroIdChange = null;
            },
            heroClickSubscriptions = {},
            $heroClickedEl,
            $heroClickedElNextSibling,
            heroClickSub = function (e) {
                $heroClickedEl = event['Event']['getEventTarget'](e);
                if (!dom['hasCssClass']($heroClickedEl, HERO_CLASS)) {
                    while (!dom['hasCssClass']($heroClickedEl, HERO_CLASS)) {
                        try {
                            $heroClickedEl = $heroClickedEl.parentNode;
                            if (!$heroClickedEl.tagName || $heroClickedEl.tagName.toLowerCase() === "body") {
                                $heroClickedEl = null;
                                break;
                            }
                        } catch (ex) {
                            $heroClickedEl = null;
                            break;
                        }
                    }
                }


                $heroClickedElNextSibling = ($heroClickedEl.nextElementSibling || $heroClickedEl['nextSibling']);


                if ($heroClickedElNextSibling && dom['hasCssClass']($heroClickedElNextSibling, HERO_CLASS) && $heroClickedElNextSibling.id) {
                    e.preventDefault();
                    dispatchHeroIdChange($heroClickedElNextSibling.id);
                }
            },




            /*
             * HERO MODULE LAZY LOAD
             */
            _heroes = null,
            $heroElements,
            $heroImage,
            $heroContent,
            $heroClickSub,
            $heroImageUrl,
            $heroImageBgPosition,
            setHeroImageHeight = function (heroImage, height, heroImageBounds) {
                var backgroundPosition;
                if (height instanceof dom['Bounds']) {
                    heroImageBounds = height;
                    height = null;
                }
                if (heroImage) {
                    if (heroImage.hasAttribute(OVERRIDE_IMAGE_HEIGHT_FLAG)) {
                        height = height || dom['getViewportHeight']() + 'px';
                        heroImage.style.height = height;
                    }


                    if (heroImageBounds) {
                        backgroundPosition = heroImageBounds.backgroundPosition;
                    }


                    heroImageBounds = dom['Bounds']['fromElement'](heroImage);




                    if (backgroundPosition) {
                        heroImageBounds.backgroundPosition = backgroundPosition;
                    }


                    heroImage = height = null;
                }


                return heroImageBounds;
            },
            augmentHeroImageBounds = function (heroImage, heroImageBounds) {
                if (backgroundSizeSupported && heroImage && heroImageBounds && !heroImageBounds.hasOwnProperty('backgroundPosition')) {
                    $heroImageBgPosition = window.getComputedStyle(heroImage).getPropertyValue('background-position').split(' ');
                    heroImageBounds.backgroundPosition = {
                        // this isn't optimal, but oh well
                        x : $heroImageBgPosition[0] || '50%',
                        y : dom['getPixelValue'](heroImage, ($heroImageBgPosition[1] || 0))
                    };


                    heroImage = null;
                }


                return heroImageBounds;
            },
            getHeroes = function () {
                if (_heroes === null) {


                    $heroElements = dom['get']('.' + HERO_CLASS, true) || [];
                    _heroes = [];
                    util['each']($heroElements, function (element, i) {
                        if (!element.id) {
                            element.id = guid['Guid']['create']();
                        }


                        if (touchSupported) {
                            dom['addCssClass'](element, HERO_TOUCH_CLASS);
                        }


                        $heroImage = dom['querySelector']('.' + HERO_IMAGE_CLASS, element);
                        if ($heroImage && !backgroundSizeSupported) {
                            $heroImageUrl = window.getComputedStyle($heroImage).getPropertyValue('background-image');
                            if (util['stringStartsWith']($heroImageUrl, 'url(') && util['stringEndsWith']($heroImageUrl, ')')) {
                                $heroImageUrl = $heroImageUrl.slice(4, -1).replace(/['"]/g, '');
                                $heroImage.style.backgroundImage = 'none';
                                $heroImage.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + $heroImageUrl + "', sizingMethod='scale');";
                            }
                        }


                        $heroContent = dom['querySelector']('.' + HERO_CONTENT_CLASS, element);
                        if (element.hasAttribute('data-hero-hashclick')) {
                            if (heroClickSubscriptions.hasOwnProperty(element.id)) {
                                $heroClickSub = heroClickSubscriptions[element.id];
                            } else if (!touchSupported) {
                                $heroClickSub = new event['Event']['Subscription']('click', element, heroClickSub);
                                heroClickSubscriptions[element.id] = $heroClickSub;
                            }
                        }


                        _heroes.push({
                            bounds : dom['Bounds']['fromElement'](element),
                            image : $heroImage,
                            imageFixed : $heroImage && $heroImage.hasAttribute('data-hero-image-fixed'),
                            imageFade : $heroImage && $heroImage.hasAttribute('data-hero-image-fade'),
                            imageMinOpacity : $heroImage ? ($heroImage.getAttribute('data-hero-min-opacity') || 0) : 0,
                            imageBounds : augmentHeroImageBounds($heroImage, setHeroImageHeight($heroImage)),
                            content : $heroContent,
                            contentBounds : dom['Bounds']['fromElement']($heroContent),
                            id : element.id
                        });
                    });


                    $heroElements = $heroImage = $heroContent = $heroClickSub = null;
                }


                return _heroes;
            },




            /*
             * HERO MODULE SCROLL HANDLING
             */
            PAGE_SCROLL_MULTIPLIERS = {
                max : 0.3,
                min : 0.3
            },
            pageScrollTop,
            $pageScrollHeroBottom,
            $pageScrollHeroTop,
            $pageScrollHeroContentTop,
            $pageScrollHeroContentBottom,
            $pageScrollHeroContentOpacity,
            $pageScrollOffsetTop,
            $pageScrollAvailableSpace,
            $pageScrollBgMultiplier,
            $pageScrollImageOpacity,
            $pageScrollContentHeroStyle,
            $pageScrollContentHeroVisualOffsetTop,
            $pageScrollContentHeroVisualOffsetBottom,
            $pageScrollVisualBounds,
            pageScrollHandler = function (e) {
                pageScrollTop = dom['getScrollTop']();
                $pageScrollOffsetTop = getHeroes()[0].bounds['top'];
                $pageScrollAvailableSpace = dom['getViewportHeight']();


                util['each'](getHeroes(), function (hero, i) {
                    $pageScrollHeroBottom = hero.bounds['getBottom']() - pageScrollTop;
                    $pageScrollHeroTop = (hero.bounds['top'] - pageScrollTop);


//                    console.log(i + ': h:' + hero.bounds.height + ' | av:' + $pageScrollAvailableSpace + ' | s:' + pageScrollTop + ' | t:' + $pageScrollHeroTop + ' | b:' + $pageScrollHeroBottom);


                    if (hero.content && hero.image) {
                        if ($pageScrollHeroBottom > 0 && $pageScrollHeroTop < $pageScrollAvailableSpace) {


                            $pageScrollContentHeroStyle = window.getComputedStyle(hero.content);
                            $pageScrollContentHeroVisualOffsetTop = (parseInt($pageScrollContentHeroStyle.getPropertyValue('margin-top'), 10) || 0) + (parseInt($pageScrollContentHeroStyle.getPropertyValue('top'), 10) || 0);
                            $pageScrollContentHeroVisualOffsetBottom = (parseInt($pageScrollContentHeroStyle.getPropertyValue('margin-bottom'), 10) || 0) + (parseInt($pageScrollContentHeroStyle.getPropertyValue('bottom'), 10) || 0);


                            $pageScrollVisualBounds = new dom['Bounds'](
                                hero.contentBounds.left,
                                hero.contentBounds.top + $pageScrollContentHeroVisualOffsetTop,
                                hero.contentBounds.width,
                                hero.contentBounds.height - $pageScrollContentHeroVisualOffsetTop - $pageScrollContentHeroVisualOffsetBottom
                            );


                            $pageScrollHeroContentBottom = $pageScrollVisualBounds['getBottom']() - pageScrollTop;
                            $pageScrollHeroContentTop = ($pageScrollVisualBounds['top'] - pageScrollTop);


//                            console.log('- ' + i + ': offset: ' + $pageScrollContentHeroVisualOffsetTop + ' | cb: ' + $pageScrollHeroContentBottom + ' | ct: ' + $pageScrollHeroContentTop + ' | %b: ' + ($pageScrollHeroContentTop / pageScrollTop) + ' | %t: ' + ($pageScrollHeroContentTop / $pageScrollVisualBounds['height']));


                            if ($pageScrollHeroContentTop > $pageScrollAvailableSpace) {
                                // BELOW FOLD
//                                console.log("BELOW FOLD");
                                $pageScrollHeroContentOpacity = 0;
                            }


                            /*
                                    This was causing content to be faded even when scrolled to the top. The "in view" logic
                                    below seemed to handle the fade well enough on it's own.


                                else if ($pageScrollHeroContentTop <= $pageScrollAvailableSpace && $pageScrollHeroContentBottom >= $pageScrollAvailableSpace) {
                                    // COMING INTO VIEW FROM BOTTOM FOLD
    //                                console.log('%b: ' + (($pageScrollAvailableSpace - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height']));
                                    $pageScrollHeroContentOpacity = Math.min(1, (($pageScrollAvailableSpace - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height']));
                                }
                            */
                            else if ($pageScrollHeroContentBottom <= $pageScrollAvailableSpace && $pageScrollHeroContentTop >= $pageScrollOffsetTop) {
                                // IN VIEW
//                                console.log("IN VIEW");
                                $pageScrollHeroContentOpacity = 1;
                            } else if ($pageScrollHeroContentTop < $pageScrollOffsetTop && $pageScrollHeroBottom >= $pageScrollOffsetTop) {
                                // GOING OUT OF VIEW AT THE TOP
//                                console.log('%t: ' + (1 - (($pageScrollOffsetTop - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height'])));
                                $pageScrollHeroContentOpacity = Math.max(0, (1 - (($pageScrollOffsetTop - $pageScrollHeroContentTop) / $pageScrollVisualBounds['height'])));
                            } else if ($pageScrollHeroBottom < $pageScrollOffsetTop) {
                                // ABOVE TOP
                                $pageScrollHeroContentOpacity = 0;
//                                console.log("ABOVE TOP");
                            }


                            if (opacitySupported) {
                                hero.content.style.opacity = $pageScrollHeroContentOpacity;
                            } else {
                                hero.content.style.filter = 'alpha(opacity=' + ($pageScrollHeroContentOpacity * 100) + ')';
                            }


                            $pageScrollHeroContentTop = null;
                            $pageScrollHeroContentBottom = null;
                            $pageScrollHeroContentOpacity = null;
                            $pageScrollContentHeroStyle = null;
                            $pageScrollContentHeroVisualOffsetTop = null;
                            $pageScrollContentHeroVisualOffsetBottom = null;
                            $pageScrollVisualBounds = null;
                        }


                    }


                    if (hero.imageFade) {
                        $pageScrollImageOpacity = Math.max(($pageScrollHeroBottom / $pageScrollAvailableSpace), 0);


                        if (opacitySupported) {
                            if ($pageScrollImageOpacity > hero.imageMinOpacity) {
                                hero.image.style.opacity = $pageScrollImageOpacity;
                            }
                        } else {
                            if ($pageScrollImageOpacity > (hero.imageMinOpacity * 100)) {
                                hero.image.style.filter = 'alpha(opacity=' + ($pageScrollImageOpacity * 100) + ')';
                            }
                        }
                        $pageScrollImageOpacity = null;
                    }


                    if (backgroundSizeSupported && hero.image && !hero.imageFixed) {
                        var targetBackgroundTop = $pageScrollHeroTop;
                        if (targetBackgroundTop - $pageScrollOffsetTop > $pageScrollAvailableSpace) {
                            $pageScrollBgMultiplier = 1;
                        } else {
                            targetBackgroundTop = $pageScrollHeroBottom - $pageScrollAvailableSpace;


                            if (targetBackgroundTop <= 1 && targetBackgroundTop >= 0) {
                                targetBackgroundTop = 1;
                            } else if (targetBackgroundTop <= 0 && targetBackgroundTop >= -1) {
                                targetBackgroundTop = -1;
                            }


                            $pageScrollBgMultiplier = Math.abs(targetBackgroundTop / $pageScrollAvailableSpace);
                            if ($pageScrollBgMultiplier >= PAGE_SCROLL_MULTIPLIERS.max) {
                                $pageScrollBgMultiplier = PAGE_SCROLL_MULTIPLIERS.max;
                            } else if ($pageScrollBgMultiplier <= PAGE_SCROLL_MULTIPLIERS.min) {
                                $pageScrollBgMultiplier = PAGE_SCROLL_MULTIPLIERS.min;
                            }
                        }
                        targetBackgroundTop = (targetBackgroundTop * $pageScrollBgMultiplier) + parseInt(hero.imageBounds.backgroundPosition.y, 10);
                        if (targetBackgroundTop > pageScrollTop + $pageScrollHeroTop) {
                            targetBackgroundTop -= (targetBackgroundTop - (pageScrollTop + $pageScrollHeroTop));
                        }
                        hero.image.style.backgroundAttachment = 'fixed';
                        hero.image.style.backgroundPosition = '50% ' + (targetBackgroundTop) + 'px';


                        $pageScrollBgMultiplier = null;
                    }
                });


                $pageScrollHeroBottom = null;
                $pageScrollHeroTop = null;
                $pageScrollOffsetTop = null;
                $pageScrollAvailableSpace = null;
            },
            pageScrollSub = new event['Event']['Subscription']('scroll', window, pageScrollHandler),
            $dispatchPageScrollTimeout,
            dispatchPageScroll = function () {
                window.clearTimeout($dispatchPageScrollTimeout);
                if (pageScrollSub['isBound']()) {
                    $dispatchPageScrollTimeout = window.setTimeout(pageScrollHandler, 0);
                }
            },




            /*
             * HERO MODULE RESIZE HANDLING
             */
            pageResizeHandler = function () {
                util['each'](getHeroes(), function (hero, i) {
                    hero.bounds = dom['Bounds']['fromElement'](dom['get'](hero.id));
                    hero.imageBounds = augmentHeroImageBounds(hero.image, setHeroImageHeight(hero.image, hero.imageBounds));
                    hero.contentBounds = dom['Bounds']['fromElement'](hero.content);
                });


                dispatchPageScroll();
            },
            pageResizeSub = new event['Event']['Subscription']('resize', window, pageResizeHandler),
            $dispatchPageResizeTimeout,
            dispatchPageResize = function () {
                window.clearTimeout($dispatchPageResizeTimeout);
                if (pageResizeHandler['isBound']()) {
                    $dispatchPageResizeTimeout = window.setTimeout(pageResizeHandler, 0);
                }
            },




            /*
             * INITIALIZATION
             */
            init = (function () {
                var hash = window.location.hash.split('#', 2)[1];


                if (touchSupported) {
                    pageScrollSub['detach']();
                    pageResizeSub['detach']();
                } else {
                    dispatchPageScroll();
                }


                getHeroes();


                html.classList.add('paste-ui-heroscroll-loaded');
                body.classList.add('paste-ui-heroscroll-loaded');
            }());
    }
);