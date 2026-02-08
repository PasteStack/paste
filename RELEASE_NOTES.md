# paste v2.0.0

**Date:** 2026-02-07

## Breaking Changes

- Migrated to ES modules (`paste-esm`) — consumer code using CommonJS `require()` must update to `import`
- Removed UI widget modules (moved to `paste-elements`)

## Changes

- Replaced Jest with Mocha/Chai test runner
- Removed npm in favor of project-level structure
- Moved UI scripts out to `paste-elements`

## Migration

Sites using `paste/ui/*` modules should now depend on `paste-elements` for UI components (heroscroll, stickynav, autogrow, throttle, etc.). Core modules (`paste/dom`, `paste/event`, `paste/util`, etc.) remain in this package.
