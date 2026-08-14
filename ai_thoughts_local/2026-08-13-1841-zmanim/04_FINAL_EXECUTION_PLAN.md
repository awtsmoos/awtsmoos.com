B"H
Boruch Hashem
Blessed is He

# Zmanim — Final Execution Plan

The Awtsmoos renews the heavens with every measured ray;
Awtsmoos.com will reveal the clock without pretending the clock is the day.

## Final Scope
Build a production-quality, dependency-free `/zmanim` route within `geelooy/zmanim`, leaving existing source files untouched. The implementation will use Open-Meteo only for worldwide place lookup, NOAA-derived mathematics for deterministic solar-angle events, and USNO as an independent government data reference. Chabad/Alter Rebbe methodology is primary and additional opinions are selectable.

## Files To Create
### Shell and styles
- `geelooy/zmanim/index.html`
- `geelooy/zmanim/styles/tokens.css`
- `geelooy/zmanim/styles/layout.css`
- `geelooy/zmanim/styles/components.css`

### Configuration
- `geelooy/zmanim/js/config/opinions.js`
- `geelooy/zmanim/js/config/zmanim.js`

### Domain
- `geelooy/zmanim/js/domain/solar-equations.js`
- `geelooy/zmanim/js/domain/solar-events.js`
- `geelooy/zmanim/js/domain/timezone.js`
- `geelooy/zmanim/js/domain/zmanim-calculator.js`

### Services
- `geelooy/zmanim/js/services/geocoding-service.js`
- `geelooy/zmanim/js/services/usno-service.js`

### UI
- `geelooy/zmanim/js/components/calendar-component.js`
- `geelooy/zmanim/js/components/location-search.js`
- `geelooy/zmanim/js/components/zmanim-grid.js`
- `geelooy/zmanim/js/components/methodology-panel.js`
- `geelooy/zmanim/js/state/zmanim-store.js`
- `geelooy/zmanim/js/app.js`

### Verification and handoff
- `geelooy/zmanim/tests/solar-events.test.mjs`
- `geelooy/zmanim/tests/zmanim-calculator.test.mjs`
- `geelooy/zmanim/README.md`

## Implementation Sequence
1. Create directory tree.
2. Write configuration and pure astronomy modules first.
3. Write the halachic calculator against those pure interfaces.
4. Write services and normalization boundaries.
5. Write store and custom web components.
6. Write app composition and semantic HTML.
7. Write mobile-first CSS.
8. Read back all files and compare against this plan.
9. Write any missing implementation in complete-file rewrites only.
10. Write tests only after the first implementation pass is complete.
11. Run syntax checks and unit tests.
12. Perform real external data checks.
13. Run browser verification at local `/zmanim`.
14. Inspect mobile viewport and interaction states.
15. Produce a final delta/review artifact.

## Halachic Data Contract
Every calculated item returns `{ id, label, time, group, method, status }`. `time` is either a valid `Date` or null. A missing astronomical event is never coerced into a neighboring day's time unless a profile explicitly defines a fallback. The default Chabad profile will use 16.9°, 10.2°, 1.583°, 6°, and 8.5° solar depression anchors as documented, while practical visible sunrise/sunset remain the standard 0.833° events.

## Opinion Contract
- `chabad`: Alter Rebbe/Chabad default; proportional day is true sunrise to true sunset.
- `gra`: proportional day is practical sunrise to practical sunset.
- `magen-avraham-72`: proportional day spans fixed 72 minutes before sunrise through fixed 72 minutes after sunset, labeled clearly as that convention rather than as the Chabad default.

Additional angle-based Magen Avraham conventions can be added later because profile calculation anchors are data-driven.

## Calendar Contract
`<awtsmoos-zmanim-calendar>` owns its month navigation, seven-column grid, selected day, today marker, focus day, keyboard movement, and `date-change` custom event. It accepts an ISO `value` property and remains independent of global app state.

## Search Contract
The location search performs no request for fewer than two characters, waits briefly after input, cancels stale requests, renders normalized results, and emits a single `location-select` event. Remote strings enter the DOM only through safe text APIs.

## Visual Contract
Mobile first at 320px. Controls stack naturally; primary search and date controls are always reachable without horizontal scrolling; result cards use fluid grids; expanded methodology uses readable prose. Desktop adds columns but does not change information hierarchy.

## Verification Thresholds
- No syntax errors.
- All domain tests pass.
- Search returns real results for both `Brooklyn` and `11213`.
- USNO returns a real response for a known location/date via network verification.
- Calculated published sunrise/sunset differ from USNO by no more than a small expected calculation tolerance for ordinary latitudes; any larger delta is investigated.
- Browser page loads with no uncaught console errors.
- Calendar changes the selected date and recomputes results.
- Opinion switch changes proportional-hour zmanim without another geocode request.
- 320px viewport has no horizontal page overflow.

## Stop Gate
Stop only after code, tests, real-data verification, browser verification, readback, and planned-vs-actual review have evidence. A rendered page alone is not completion.
