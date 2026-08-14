B"H
Boruch Hashem
Blessed is He

# Zmanim Phase Two — Architecture and File Graph

The Awtsmoos gives one calculation many vessels but never many conflicting truths;
Awtsmoos.com should let browser, API, tests, and future apps drink from the same roots.

## Canonical Calculation Boundary
`geelooy/zmanim/js/domain/*` and `geelooy/zmanim/js/config/*` remain the single source of astronomical and halachic truth. The API will use dynamic `import()` from CommonJS to load these ESM modules. There will be no second solar formula implementation in the API tree.

## API Mounts
Canonical mount: `geelooy/api/zmanim/_awtsmoos.derech.js` -> `/api/zmanim/*`.
Compatibility mount: `geelooy/api/zmanimms/_awtsmoos.derech.js` -> same module -> `/api/zmanimms/*`.

## API Contract
### `GET /api/zmanim` and `GET /api/zmanim/day`
Required: `lat`, `lng`.
Optional: `date=YYYY-MM-DD`, `timezone=IANA`, `opinion=chabad|gra|magenAvraham72`, `label`.
Response: version, request, location, opinion, shaah-zmanis duration, calculation anchors, 18 serialized zmanim, warnings, source metadata.

### `GET /api/zmanim/range`
Required: `lat`, `lng`, `start`.
Optional: `days` bounded to 1..31, timezone, opinion.
Response: array of daily payloads without external API calls.

### `GET /api/zmanim/location?q=`
Server-side proxy to the same worldwide geocoding provider, normalized into the app's location shape. Bound query length and result count.

### `GET /api/zmanim/opinions`
Return public supported opinion metadata and the default.

### `GET /api/zmanim/methodology`
Return calculation definitions, angles, cautions, and source URLs in machine-readable form.

### `GET /api/zmanim/usno`
Same location/date inputs as day endpoint; compare standard sunrise/sunset against the U.S. Naval Observatory. Failure is isolated from core calculation endpoints.

### `GET /api/zmanim/health`
Return API version, default opinion, supported opinion IDs, calculation module health, and server timestamp.

## API Files
- `geelooy/api/zmanim/_awtsmoos.derech.js` — route declaration only.
- `geelooy/api/zmanim/lib/domainLoader.js` — cached dynamic ESM imports.
- `geelooy/api/zmanim/lib/validation.js` — query parsing and bounded validation.
- `geelooy/api/zmanim/lib/serializer.js` — Dates and calculation results into stable JSON.
- `geelooy/api/zmanim/lib/dayService.js` — one-day calculation assembly.
- `geelooy/api/zmanim/lib/rangeService.js` — bounded date range.
- `geelooy/api/zmanim/lib/locationService.js` — server geocoding proxy.
- `geelooy/api/zmanim/lib/usnoService.js` — server government validation.
- `geelooy/api/zmanim/lib/metadataService.js` — opinions/methodology/health payloads.
- `geelooy/api/zmanim/README.md` — endpoint reference and examples.
- `geelooy/api/zmanim/test/*.test.cjs` — validation, serialization, day/range, alias contracts.
- `geelooy/api/zmanimms/_awtsmoos.derech.js` — compatibility re-export.

## UX File Changes
Existing files will only be changed through complete-file rewrites.

New modules:
- `geelooy/zmanim/js/components/day-navigation.js` — previous/today/next controls.
- `geelooy/zmanim/js/components/opinion-selector.js` — descriptive segmented shita cards.
- `geelooy/zmanim/js/components/day-timeline.js` — alos→night timeline and current position.
- `geelooy/zmanim/js/components/next-zman.js` — next milestone/countdown.
- `geelooy/zmanim/js/components/share-actions.js` — copy link and copy zmanim text.
- `geelooy/zmanim/js/domain/day-status.js` — passed/upcoming/next-state calculations.
- `geelooy/zmanim/js/state/url-state.js` — full URL hydration/serialization.
- `geelooy/zmanim/styles/timeline.css` — timeline visuals.
- `geelooy/zmanim/styles/actions.css` — segmented controls and share actions.

Complete rewrites likely:
- `index.html` — richer hierarchy and mounts.
- `app.js` — compose new components, remain under 120 lines.
- `zmanim-grid.js` — pass/upcoming emphasis and direct explanation hooks.
- `zmanim-store.js` — URL hydration and recent-location persistence boundaries.
- `layout.css`, `cards.css`, `responsive.css` — upgraded responsive visual hierarchy.

## Verification
1. API module syntax / CommonJS parse.
2. Existing 9 browser-domain tests remain green.
3. New API tests.
4. Start actual Awtsmoos dynamic server and curl canonical + alias routes.
5. Validate error responses for invalid lat/lng/date/opinion/range length.
6. Real geocoder and USNO API checks.
7. Browser interactions: next-zman, day nav, shita cards, timeline, sharing, URL reload hydration.
8. Mobile 320px, 390px, tablet and desktop layout checks.
9. Console/network error audit.
10. Final complete-file readback and planned-vs-actual delta.
