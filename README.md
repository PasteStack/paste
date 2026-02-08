# paste

![Author](https://img.shields.io/badge/author-Thomas%20Schena-blue)
![GitHub](https://img.shields.io/badge/github-sgoggles-black?logo=github)
![License](https://img.shields.io/badge/license-MIT-green)
![Version](https://img.shields.io/badge/version-2.0.1-blue)

**paste** is a minimalist, dependency-free JavaScript toolkit originally created in **2011** to power high-performance webviews inside early iPhone applications. It is the foundational layer of [PasteStack](https://github.com/PasteStack).

## What's New in v2.0.0

- **ES modules** — `paste-esm.js` provides native `import`/`export` support
- **Mocha/Chai** test runner replaces Jest
- **UI widgets removed** — heroscroll, stickynav, autogrow, etc. moved to [paste-elements](https://gitlab.com/tomshley/brands/global/tware/tech/products/paste/paste-elements)
- **Project restructure** — npm removed in favor of project-level structure

See [RELEASE_NOTES.md](RELEASE_NOTES.md) for full details.

## Architecture

![gap-paste.png](readme-images/gap-paste.png)

![paste-client-server.png](readme-images/paste-client-server.png)

![paste-server.png](readme-images/paste-server.png)

![paste-feature-eventing.png](readme-images/paste-feature-eventing.png)

## Modules

| Module | Description |
|--------|-------------|
| `paste/dom` | DOM utilities and CSS class manipulation |
| `paste/event` | Cross-browser event system |
| `paste/oop` | Lightweight OOP (inheritance, mixins) |
| `paste/util` | Object/array/string utilities |
| `paste/io` | Async script loading and XHR |
| `paste/storage` | localStorage/sessionStorage abstraction |
| `paste/featuredetect` | Feature detection (`paste/has`) |
| `paste/lru` | LRU cache |
| `paste/speed` | Performance measurement helpers |
| `paste/guid` | GUID generation |
| `paste/formdata` | FormData utilities |
| `polyfills/*` | Array, Object, selectors, performance, etc. |

## Usage

### ES Module

```js
import Paste, { dom, util } from "https://cdn.jsdelivr.net/gh/PasteStack/paste@v2.0.1/src/js/paste-esm.js";

dom.addCssClass(document.body, "paste-ready");
```

### Script Tag

```html
<script src="https://cdn.jsdelivr.net/gh/PasteStack/paste@v2.0.1/src/js/paste.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PasteStack/paste@v2.0.1/src/js/dom.js"></script>
<script src="https://cdn.jsdelivr.net/gh/PasteStack/paste@v2.0.1/src/js/util.js"></script>
```

### JAM Combo URL (via paste-assetgraph)

```html
<script src="/jam?v=2.0.1&m=paste/dom,paste/event,paste/util"></script>
```

## Performance

Historical benchmarks in `readme-images/` (Chrome, Chrome Canary, Firefox, Safari) demonstrate paste's focus: **consistent performance across engines**.

![performance-2013-chrome.png](readme-images/performance-2013-chrome.png)

![performance-2013-chrome-canary.png](readme-images/performance-2013-chrome-canary.png)

![performance-2013-firefox.png](readme-images/performance-2013-firefox.png)

![performance-2013-safari.png](readme-images/performance-2013-safari.png)

## PasteStack Ecosystem

paste is the foundation of PasteStack. UI components, asset pipeline, and surface rendering build on top:

```
paste              ← you are here (core JS utilities)
paste-elements     ← JS/SCSS UI components (YUI-style modules)
paste-assetgraph   ← Rust pipeline: bundles + manifest.json
paste-surface-*    ← templates, ViewModels, asset injection
```

## Project Goals

- Provide the smallest possible set of utilities to build real applications fast
- Direct DOM and event operations over heavy abstractions
- Cross-platform: works in browsers, webviews, and server-rendered contexts
- Zero dependencies, ~11k/8k gzipped

## License

MIT
