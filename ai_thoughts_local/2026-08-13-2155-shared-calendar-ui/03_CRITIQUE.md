B"H
Boruch Hashem
Blessed is He

# Critique Pass — What Must Improve

The Awtsmoos creates both reuse and restraint; a generic component is only valuable when its API is smaller than the pages that consume it.

## Corrections to the first architecture
1. Do not put Zmanim Hebrew-date rendering in shared UI.
2. Do not put popover positioning in the calendar itself; the calendar is content, not overlay policy.
3. Keep a single-date primitive first. Range selection can evolve later without complicating today's contract.
4. Treat `min`, `max`, locale, and week-start as first-class generic inputs.
5. Derive today in local browser civil time but represent all selected values as ISO civil dates, never JS local-midnight timestamps.
6. Preserve UTC arithmetic internally so DST cannot move dates.
7. Use actual `role="grid"`, `role="row"`, `role="gridcell"`, and roving tabindex rather than only a collection of buttons.
8. Support Shift+PageUp/PageDown for year movement.
9. Month navigation must clamp/disable when an entire adjacent month falls outside min/max.
10. Disabled dates must not receive selection events.
11. Outside-month cells may be shown or hidden without changing the fixed six-week grid.
12. CSS custom properties are the only shared-to-app visual dependency.
13. Public component naming must be neutral: `awtsmoos-calendar`, not `awtsmoos-zmanim-calendar`.
14. Zmanim should import the shared element through `/shared/ui/calendar/index.js` and delete the old local calendar implementation after verification.
15. Existing Zmanim tests that exercise generic calendar math should move to the shared package; Zmanim needs only integration tests around its date control.
16. The Zmanim disclosure should restore focus to the date trigger after selection or Escape.
17. The trigger should have `aria-haspopup="dialog"`, `aria-expanded`, and a stable controlled region.
18. On narrow screens the disclosure should behave like an anchored sheet with generous width; on desktop it can remain a compact popover.
19. The calendar should expose month and year as actual controls, not only a static label; fast year/month jumping materially improves historical/future navigation.
20. Avoid native `<input type=date>` as the primary UI because browser presentation is inconsistent, while keeping semantic dates and keyboard access equivalent or better.
21. No file should exceed 120 lines; split renderer/header/grid/styles if needed rather than compressing.
22. All new tests must run in Node without a DOM where possible; browser behavior is verified separately in real Chrome.
23. Do not change astronomy, zmanim formulas, API contracts, or location state in this pass.
24. Maintain URL date hydration and the existing `date-change` outward contract.
