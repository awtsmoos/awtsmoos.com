B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Execution Plan

The Awtsmoos renews the measured day while interface learns restraint and grace;
Awtsmoos.com will reveal what matters first, yet every deeper zman keeps its rightful place.

## Final scope
1. Compact the hero into a practical brand/header band.
2. Rebuild the main control deck around place, date, and shita.
3. Collapse the full calendar by default behind an accessible date trigger.
4. Add bounded recent-place chips persisted locally.
5. Upgrade next-zman presentation with previous/next context.
6. Add a six-item key-times component.
7. Improve timeline with a true current marker.
8. Rebuild all-zmanim cards into denser scan-friendly rows.
9. Merge warning and USNO state visually into a compact trust section without hiding either.
10. Add a concise sticky context row that remains useful while scrolling.
11. Refine tokens, spacing, typography, radii, surfaces, and desktop/mobile breakpoints.
12. Keep API/calculation contracts untouched.

## Files to create
- `geelooy/zmanim/js/domain/key-zmanim.js`
- `geelooy/zmanim/js/state/recent-locations.js`
- `geelooy/zmanim/js/components/date-control.js`
- `geelooy/zmanim/js/components/key-zmanim.js`
- `geelooy/zmanim/js/components/trust-strip.js`
- `geelooy/zmanim/styles/dashboard.css`
- `geelooy/zmanim/styles/compact-list.css`
- `geelooy/zmanim/tests/key-zmanim.test.mjs`
- `geelooy/zmanim/tests/recent-locations.test.mjs`

## Files to rewrite completely
- `geelooy/zmanim/index.html`
- `geelooy/zmanim/js/app.js`
- `geelooy/zmanim/js/controllers/app-events.js`
- `geelooy/zmanim/js/components/location-search.js`
- `geelooy/zmanim/js/components/day-navigation.js` if still needed after date-control extraction
- `geelooy/zmanim/js/components/next-zman.js`
- `geelooy/zmanim/js/components/day-timeline.js`
- `geelooy/zmanim/js/components/zmanim-grid.js`
- `geelooy/zmanim/js/components/methodology-panel.js`
- `geelooy/zmanim/styles/tokens.css`
- `geelooy/zmanim/styles/hero.css`
- `geelooy/zmanim/styles/layout.css`
- `geelooy/zmanim/styles/components.css`
- `geelooy/zmanim/styles/actions.css`
- `geelooy/zmanim/styles/timeline.css`
- `geelooy/zmanim/styles/cards.css`
- `geelooy/zmanim/styles/methodology.css`
- `geelooy/zmanim/styles/responsive.css`
- `geelooy/zmanim/README.md`

## Execution sequence
1. Inspect rendered current page on real Chrome before edits and capture desktop/mobile evidence.
2. Create pure key-zman and recent-location helpers plus tests.
3. Create compact date/key-times/trust components.
4. Rewrite next-zman/timeline/grid/location search and composition.
5. Rewrite page shell and CSS modules.
6. Run line-count, indentation, compressed-arrow, syntax, and full automated test gates.
7. Start real Awtsmoos dynamic server on an isolated free port.
8. Verify real Chrome at 320/390/768/1440, interactions, keyboard, recents, calendar disclosure, URL hydration, full 18-zman count, and runtime console.
9. Inspect actual screenshots for mobile and desktop hierarchy; correct any visual issues.
10. Re-read all touched files and compare plan versus implementation.
11. Rerun complete test/structural/browser gates after any visual correction.
12. Stop isolated server, confirm port clear, and report only verified results.
