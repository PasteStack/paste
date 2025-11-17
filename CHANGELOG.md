# Changelog

## v1.0.0

First modernized release of Paste.js.

### Added
- Apache 2.0 licensing and file headers.
- ESM entry point (`src/paste-esm.js`) for modern bundlers (Webpack, Rollup, Vite).
- GitLab CI pipeline to run tests and generate docs from JSDoc.
- Simple JSDoc-to-Markdown docs generator (`scripts/generate-docs.cjs`) producing `docs/api/`.
- README badges and initial documentation structure.

### Notes
- CDN usage is now recommended via jsDelivr using the `v1.0.0` tag.
- Tests are intentionally lightweight and focus on existence/shape, so they remain compatible with legacy behavior.
