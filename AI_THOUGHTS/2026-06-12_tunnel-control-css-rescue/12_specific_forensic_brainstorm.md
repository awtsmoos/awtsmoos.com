B"H

# Specific Forensic Brainstorm: Dashboard Layout Only

Scope is intentionally narrow: no broad CSS hunting. The target is the dashboard corruption shown in the screenshot.

Exact target chain:

`body` -> `.awt-control-shell` -> `.awt-control-main` -> `.awt-dashboard` -> `.awt-dashboard-head` -> `.awt-mini-kicker`, `h2`, `p`, `.awt-dashboard-metrics`

Hypothesis A: `.awt-dashboard-head` was the root collapse.
- Confidence: high.
- Test: dashboard.css must define named grid areas and assign all four direct children.

Hypothesis B: responsive.css could override dashboard header at max-width 760.
- Confidence: medium.
- Test: responsive.css must preserve the same grid areas in mobile breakpoint.

Hypothesis C: broad text-breaking rules could recreate one-word text if any container narrows.
- Confidence: medium.
- Test: normal dashboard prose must not be under broad `word-break:break-word` or `overflow-wrap:anywhere` selectors.

Hypothesis D: JS renders unexpected children or wrappers.
- Confidence: medium.
- Test: `dashboard.js` intro() returns exactly four nodes and CSS matches those class names.

Hypothesis E: stale CSS import order could override the fix.
- Confidence: low-medium.
- Test: inspect `future/index.css` order and search duplicate `.awt-dashboard-head` definitions.

Hypothesis F: active connected repo may not be the original Windows repo.
- Confidence: true.
- Test: record connected root and verify current file contents. Do not claim live Windows path verification while connected to Android/Termux root.

Next exact actions:
1. Read index.css, dashboard.css, responsive.css, dashboard.js, dashboardPager.js, dashboardSections.js.
2. Run a targeted static analyzer that confirms class generation and CSS selectors.
3. Produce a forensic report file with pass/fail per hypothesis.
4. Only write code if the analyzer proves a specific failure.
