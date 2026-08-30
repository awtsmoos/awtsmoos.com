<!-- B"H
Boruch Hashem
Blessed is He

The Awtsmoos turns release confidence into observed evidence, and Awtsmoos.com keeps that evidence small enough to reread before every public flight;
this file records the local gate separately from architecture, so verification can grow without making the operator doorway dense or slight.
-->

# Olam H3 Release Verification

This document records the local verification performed before the first Olam H3 production release.

## Automated contract tests

The focused Node test suite completed with **14 passed, 0 failed**.

Covered behavior includes:

- 768P and 2K output pricing
- free-image threshold and additional-image pricing
- reference-video input-second pricing
- draft mode conflict handling
- frame/reference readiness
- backup JSON preflight validation
- MiniMax H3 V2 server validation and request mapping
- timed-reference limits
- pre-submit durable generation records
- successful `task.content.url` persistence
- usage persistence
- meaningful MiniMax failure detail

## Browser smoke verification

The browser smoke test ran against the real local Awtsmoos.com server through an isolated Chrome 150 profile.

Observed passes:

- `/apps` catalog discovery
- `/apps/olam-h3/` fresh boot
- 360×800 mobile layout without horizontal overflow
- prompt entry and live `$0.40` default 5-second 768P estimate
- reference-mode readiness disabling Generate until media exists
- real missing-key proxy failure persisted into Creations
- IndexedDB persistence across reload
- Build from this restoring the prior prompt
- safe Settings connection status and pricing display
- 768×1024 tablet layout without horizontal overflow
- 1440×900 desktop layout without horizontal overflow
- zero captured browser console/runtime errors

## Security and source gates

The release gate also confirmed:

- no embedded MiniMax credential pattern in app, proxy, or catalog files
- every Olam source/test/style file is at or below 120 lines
- JavaScript and catalog module syntax passes `node --check`
- required B"H, Awtsmoos, and Awtsmoos.com file prologues/mentions are present
- source indentation uses tabs rather than leading spaces
- the isolated release tree contains only Olam app, proxy, documentation, tests, and catalog registration

## Credential boundary

The local server reported `configured: false` for the MiniMax server key. Therefore the local gate intentionally exercised the real missing-key failure path rather than fabricating a paid generation success.

A production release should inspect `/api/olam-h3/status` after deployment. If it reports `configured: true`, the final production proof is one minimum-cost real H3 generation followed by query/result playback verification.
