B"H

# Phase Two: Specific File Plan

Inspection revealed the real shape:

- `index.html` imports `css/app.css`.
- `css/app.css` imports `css/future/index.css`.
- `future/index.css` imports view modules in CSS layers.
- The broken visible section is the home dashboard rendered by `js/dashboard/dashboard.js`.
- The dashboard header creates four direct children: `.awt-mini-kicker`, `h2`, `p`, and `.awt-dashboard-metrics`.
- `css/future/views/dashboard.css` currently gives `.awt-dashboard-head` two columns: `minmax(0, 1fr) auto` without assigning the four children to sane grid areas.
- Because `.awt-dashboard-metrics` lands in the auto column, its four cards become a huge intrinsic width; the first column collapses. The paragraph then wraps one word per line while the title collides visually with the kicker.

Actual target file to rewrite completely:

1. `geelooy/apps/tunnel-control/css/future/views/dashboard.css`

The repair:

- Keep the dashboard tile styling intact.
- Rewrite the whole CSS module, not a partial patch.
- Make `.awt-dashboard-head` a named grid:
  - kicker
  - title
  - copy
  - metrics
- Put metrics on their own full-width row.
- Make all header text max-width and avoid forced one-word wrapping.
- Preserve responsive breakpoints, card grid, action cards, pagination, and section title styles.

Verification plan:

- Re-read the rewritten file.
- Run a command to check CSS braces quickly.
- Use browser/runtime if available or run a static inspection that confirms direct header children now have full-width grid placement.
