
![Author](https://img.shields.io/badge/author-Thomas%20Schena-blue)
![GitHub](https://img.shields.io/badge/github-sgoggles-black?logo=github)
![License](https://img.shields.io/badge/license-Apache--2.0-green)

## Paste Overview

![gap-paste.png](readme-images/gap-paste.png)

![paste-client-server.png](readme-images/paste-client-server.png)

![paste-server.png](readme-images/paste-server.png)

![paste-feature-eventing.png](readme-images/paste-feature-eventing.png)

## Performance of Paste

![performance-2013-chrome.png](readme-images/performance-2013-chrome.png)

![performance-2013-chrome-canary.png](readme-images/performance-2013-chrome-canary.png)

![performance-2013-firefox.png](readme-images/performance-2013-firefox.png)

![performance-2013-safari.png](readme-images/performance-2013-safari.png)


## Linking to Paste with JsDeliver

### Core Files

https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/dom.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/formdata.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/has.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/lru.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/paste.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/speed.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/event.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/guid.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/io.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/oop.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/storage.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/util.js

### Polyfills
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/array.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/focusinout.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/getcomputedstyle.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/ie8head/html5.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/ie8head/json2.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/object.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/performance.js
https://cdn.jsdelivr.net/gh/tomshley/paste@v2025.05.27.4/src/js/polyfills/selectors.js


## Project Goals

Paste.js is intended to serve as a durable, cross-platform toolkit for:

- Bridging gaps between legacy browsers and modern environments.
- Providing a thin, fast abstraction over DOM, events, storage, I/O, and UI widgets.
- Acting as the compatibility and performance layer between your app code and the browser.

The architecture diagrams in this repository (`readme-images/*.png`) illustrate Paste.js in a client/server context and how it mediates between different runtime concerns.

## Performance Benchmarks

Historical performance charts in `readme-images/` (Chrome, Chrome Canary, Firefox, Safari) capture the original focus of Paste.js: predictable performance across very different JavaScript engines.

At a high level:

- Paste.js favors direct DOM and event operations over heavy abstractions.
- It was benchmarked across multiple engines to ensure stable behavior.
- The goal is not just raw speed, but **consistent performance** across environments.

## jsDelivr CDN Links (tag v1.0.0)

Once you tag the repository with `v1.0.0`, you can consume Paste.js via jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/gh/tomshley/paste@v1.0.0/src/paste.js"></script>
<script src="https://cdn.jsdelivr.net/gh/tomshley/paste@v1.0.0/src/dom.js"></script>
<script src="https://cdn.jsdelivr.net/gh/tomshley/paste@v1.0.0/src/util.js"></script>
<!-- and so on for other modules -->
```

Or as an ES module with a bundler:

```js
import Paste, { dom, util } from "https://cdn.jsdelivr.net/gh/tomshley/paste@v1.0.0/src/paste-esm.js";

dom.addCssClass(document.body, "paste-ready");
```
