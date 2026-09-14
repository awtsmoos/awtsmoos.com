<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed be He -->

# Current State

Updated: 2026-09-09.
Canonical repo: `/Users/awtsmoos/work/awtsmoos.com`.
Remote device: `Yackovs-Air`.

## Release truth

- No production deployment has been performed for this workstream.
- No final integration commit has been created.
- The repository is heavily dirty because multiple agents are working concurrently.
- Never perform wholesale reset, clean, pull, rebase, or staging of unrelated changes.

## Verified platform state

- Canonical product economy: 47 apps + 33 games = 80 products.
- Geelooy OS represents all 80 products with zero missing/duplicate product IDs.
- Browser Tunnel account actions are session-bound and cross-origin guarded.
- Account graph projects aliases, heichelos, series, posts, Docs, and all 80 products.
- Focused account/tunnel graph regression suite last passed 6/6.

## Immutable deployment work already on disk

New or modified deployment primitives currently include:

- Drive state schema version 7 with `deployments` registry.
- `deploymentPolicy.js` for normalized immutable manifests and bounded retention.
- `deploymentService.js` plus `deploymentServiceSupport.js` for publish/list/get/rollback.
- `deploymentReadiness.js` for deployment-specific readiness testimony.
- `deploymentRoutes.js` for guarded publish/list/get/rollback HTTP routes.
- `drive-deployment` source support in site source policy/resolution.
- deployment-backed public response path using stored object hashes.

## Current in-progress step

`DEP-007` — add immutable preview deployments/environments distinct from production.

Exact first files to inspect:

- `geelooy/api/social/helper/drive/deploymentPolicy.js`
- `geelooy/api/social/helper/drive/deploymentCreate.js`
- `geelooy/apps/drive/js/site-builder/` and Website Maker preview modules
- `geelooy/sites/` public source/gateway modules

DEP-001 through DEP-006 are verified green. Focused deployment suite passes 16/16, including exact retry identity, stale-base protection, two-publisher races, and publish-vs-rollback races. Preview creation must never move the production site pointer; production promotion must remain an explicit guarded mutation.
