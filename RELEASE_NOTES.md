# paste v2.1.0

**Date:** 2026-09-23

## Changed

- `paste.io`: a reply without a `Content-Type` header, or a JSON reply
  (`application/json`, with or without parameters) whose body does not parse,
  now reaches `onFailure` with the raw response text. Earlier releases threw
  inside `readystatechange`, so neither callback ran and the caller never
  learned the request had finished.
- `paste.io.get`, `post`, `put` and `del` return `null` when no request
  transport can be created, as `open` already did, instead of throwing on the
  missing request.

## Added

- Behaviour checks for `paste.io` on Node's built-in test runner (no
  dependencies); the pipeline runs them next to the syntax check.

# paste v2.0.2

**Date:** 2026-09-22

## Licensing

- Licensed under the Apache License, Version 2.0. `LICENSE` now carries the full
  grant and `NOTICE.md` records the bundled third-party components and their terms.
- Removed the house copyright header that had been applied over vendored
  third-party sources; those files keep their own upstream notices.

## Removed

- The IE8-era shims: `polyfills/selectors` (which also required a `jquery` module
  no PasteStack package provides, so it could never load) and
  `polyfills/ie8head/{json2,html5}`. Nothing in the family referenced them, and
  they were the only third-party sources the project carried.

## Changes
- Corrected the README: there is no ES module build, and the JAM combo example now
  shows the path the JAM server actually serves,
  `/paste/{version}/{module~module}.min.js`.
- Added a pipeline that syntax-checks every shipped source file and publishes the
  source archive under the house artifact policy.

# paste v2.0.0

**Date:** 2026-02-07

## Breaking Changes

- Removed UI widget modules (moved to `paste-elements`)

## Changes

- Removed npm in favor of project-level structure
- Moved UI scripts out to `paste-elements`

> Correction: earlier copies of these notes announced an ES module entry point
> (`paste-esm`) and a Mocha/Chai runner. Neither shipped in v2.0.0 or v2.0.1; the
> modules remain classic scripts registered with `paste.define`.

## Migration

Sites using `paste/ui/*` modules should now depend on `paste-elements` for UI components (heroscroll, stickynav, autogrow, throttle, etc.). Core modules (`paste/dom`, `paste/event`, `paste/util`, etc.) remain in this package.
