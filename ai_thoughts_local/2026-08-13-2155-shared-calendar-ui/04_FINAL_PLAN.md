B"H
Boruch Hashem
Blessed is He

# Final Execution Plan — Shared Calendar Promotion

The Awtsmoos gives every date fresh being while software must give each responsibility one honest home; Awtsmoos.com will promote the calendar into shared UI and leave Zmanim with only its own halachic frame.

## Files to create
- `geelooy/shared/ui/calendar/date-math.js` — civil ISO arithmetic, bounds, grid math.
- `geelooy/shared/ui/calendar/calendar-model.js` — month/week/day presentation model.
- `geelooy/shared/ui/calendar/calendar-keyboard.js` — keyboard target calculation.
- `geelooy/shared/ui/calendar/calendar-renderer.js` — semantic calendar DOM rendering.
- `geelooy/shared/ui/calendar/calendar-styles.js` — neutral reusable Shadow DOM styles and theme variables.
- `geelooy/shared/ui/calendar/calendar-element.js` — public `<awtsmoos-calendar>` element.
- `geelooy/shared/ui/calendar/index.js` — stable shared entrypoint.
- `geelooy/shared/ui/calendar/README.md` — contract and reuse examples.
- `geelooy/shared/ui/calendar/test/date-math.test.mjs` — generic civil-date tests.
- `geelooy/shared/ui/calendar/test/calendar-model.test.mjs` — generic model/bounds/locale tests.
- `geelooy/shared/ui/calendar/test/calendar-keyboard.test.mjs` — generic keyboard tests.
- `geelooy/zmanim/styles/method-actions.css` — split method/share styling away from date controls.

## Existing files to rewrite completely
- `geelooy/zmanim/js/components/date-control.js` — consume `<awtsmoos-calendar>`, own only Zmanim disclosure/day shortcuts/Hebrew date.
- `geelooy/zmanim/styles/actions.css` — date-control/disclosure styles only, below 120 lines.
- `geelooy/zmanim/styles/responsive.css` — adapt the generic calendar container on mobile and preserve existing breakpoints.
- `geelooy/zmanim/index.html` — load the split action stylesheet without disturbing route content.
- `geelooy/zmanim/tests/calendar-math.test.mjs` — integration-level imports from the promoted shared math rather than local duplication.
- `geelooy/zmanim/README.md` — explain the shared calendar dependency and Zmanim adapter boundary.

## Old local files to remove after references are proven absent
- `geelooy/zmanim/js/components/calendar-component.js`
- `geelooy/zmanim/js/components/calendar-renderer.js`
- `geelooy/zmanim/js/components/calendar-styles.js`
- `geelooy/zmanim/js/components/calendar-math.js`

## Behavior contract
- `<awtsmoos-calendar>` selects one ISO civil date and emits composed+bubbling `date-change`.
- Arrow keys move by day/week; Home/End move to configured week boundaries; PageUp/PageDown move month; Shift+PageUp/PageDown move year.
- `min` and `max` disable invalid cells and month navigation beyond the bounded range.
- `locale` controls month and weekday labels; `week-start` controls grid ordering.
- Selected date uses `aria-selected`; today uses `aria-current="date"`; one date has tabindex 0.
- Month and year have direct jump controls so long-range navigation is not dozens of arrow clicks.
- Zmanim date trigger uses `aria-haspopup="dialog"`, closes after selection or Escape, and returns focus to the trigger.
- Zmanim keeps its previous/today/next controls and Hebrew date; shared UI remains free of halachic concerns.

## Verification sequence
1. Grep all old local calendar references before deletion.
2. Create shared package and pure tests.
3. Rewrite Zmanim adapter/styles/tests/index/README.
4. Delete only the proven-unused old local calendar files.
5. Run source line-count, tabs/spacing, compressed-function, and Node syntax gates.
6. Run all Zmanim tests plus all shared-calendar tests.
7. Start the real Awtsmoos server on an isolated port.
8. Verify `/shared/ui/calendar/index.js` is served and `/zmanim/` loads without runtime errors.
9. Real Chrome: open/close calendar, direct month/year jump, arrow/Home/End/Page navigation, selected date, URL hydration, previous/today/next, shita controls, search, and 18-zman list.
10. Check 320/390/768/1440 overflow and inspect mobile/desktop screenshots.
11. Re-read every touched file and compare against this plan.
12. If anything diverges, perform one final complete-file correction pass and rerun all gates before reporting completion.
