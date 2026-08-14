B"H
Boruch Hashem
Blessed is He

# Zmanim Phase Two — Final Execution Plan

The Awtsmoos renews the instant while code reveals one measured gate;
Awtsmoos.com will make the page more beautiful and the API more reusable without duplicating fate.

## Final UX Scope
1. Add a next-zman hero with contextual countdown only when the selected civil date is today in the selected timezone.
2. Add a compact visual timeline for major anchors: alos, sunrise, chatzos, sunset, tzeis.
3. Add previous / today / next day controls around the owned calendar.
4. Add a descriptive opinion selector that mirrors the native select and preserves keyboard/form semantics.
5. Add copy-link and copy-all-zmanim actions with visible success/failure feedback.
6. Fully hydrate URL state for date, opinion, lat, lng, timezone and bounded location label.
7. Mark result cards as passed / next / upcoming when the selected date is today.
8. Upgrade the mobile/desktop layout hierarchy and micro-interactions without harming 320px support.

## Final API Scope
Canonical `/api/zmanim` plus compatibility `/api/zmanimms`, both supporting:
- `/` and `/day`
- `/range`
- `/location`
- `/opinions`
- `/methodology`
- `/usno`
- `/health`

All endpoints are public GET/OPTIONS APIs, with CORS enabled and explicit input validation. Core calculations never make external calls.

## Files To Create
### API
- `geelooy/api/zmanim/_awtsmoos.derech.js`
- `geelooy/api/zmanim/lib/domainLoader.js`
- `geelooy/api/zmanim/lib/validation.js`
- `geelooy/api/zmanim/lib/serializer.js`
- `geelooy/api/zmanim/lib/dayService.js`
- `geelooy/api/zmanim/lib/rangeService.js`
- `geelooy/api/zmanim/lib/locationService.js`
- `geelooy/api/zmanim/lib/usnoService.js`
- `geelooy/api/zmanim/lib/metadataService.js`
- `geelooy/api/zmanim/README.md`
- `geelooy/api/zmanim/test/api-core.test.cjs`
- `geelooy/api/zmanim/test/validation.test.cjs`
- `geelooy/api/zmanimms/_awtsmoos.derech.js`

### UX
- `geelooy/zmanim/js/domain/day-status.js`
- `geelooy/zmanim/js/state/url-state.js`
- `geelooy/zmanim/js/components/next-zman.js`
- `geelooy/zmanim/js/components/day-timeline.js`
- `geelooy/zmanim/js/components/day-navigation.js`
- `geelooy/zmanim/js/components/opinion-selector.js`
- `geelooy/zmanim/js/components/share-actions.js`
- `geelooy/zmanim/styles/timeline.css`
- `geelooy/zmanim/styles/actions.css`

## Files To Rewrite Completely
- `geelooy/zmanim/index.html`
- `geelooy/zmanim/js/app.js`
- `geelooy/zmanim/js/state/zmanim-store.js`
- `geelooy/zmanim/js/components/zmanim-grid.js`
- `geelooy/zmanim/styles/layout.css`
- `geelooy/zmanim/styles/cards.css`
- `geelooy/zmanim/styles/responsive.css`
- `geelooy/zmanim/README.md`

## Sequence
1. Create API directories and pure helper modules.
2. Create API route mount and alias.
3. Create UX state/domain helpers.
4. Create new Web Components.
5. Rewrite composition/store/grid/HTML/styles.
6. Audit all source files for <=120 lines and tab indentation before tests.
7. Write API and new UX-domain tests.
8. Run old + new test suites and syntax checks.
9. Start the actual Awtsmoos dynamic server and curl every API endpoint plus error cases.
10. Start browser verification and test location search, URL reload hydration, shita selector, day navigation, timeline, next-zman, copy actions and 320px layout.
11. Re-read all touched files, record planned-vs-actual delta, correct anything material, rerun full verification.

## API Error Contract
Bad user inputs return `status: 400` with `{ BH, ok: false, error: { code, message, field } }`. Unexpected failures return a generic server error shape without leaking stacks to public callers.

## Stop Gate
No stop until canonical and alias APIs are proven through the real dynamic server and the improved UX is proven through real Chrome at mobile and desktop dimensions.
