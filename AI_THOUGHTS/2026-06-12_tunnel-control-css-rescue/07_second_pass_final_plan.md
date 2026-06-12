B"H

# Second Pass Final Plan

Final improvements before writing:

1. Do not remove overflow protection entirely.
2. Do not touch JS.
3. Do not touch imports.
4. Do not make a partial patch.
5. Preserve every breakpoint from the current file.
6. Make ordinary text readable by default.
7. Keep `anywhere` only for technical strings.
8. Keep buttons flexible but not broken into fragments.
9. Keep tables horizontally scrollable.
10. Keep card grids responsive.
11. Make dashboard metrics 2 columns below 1120px and 1 below 760px as before.
12. Keep mobile shell stacking at 900px.
13. Keep compact card behavior below 760px.
14. Keep tiny fallback below 350px.
15. Add comments explaining the rescue.
16. Verify after writing.
17. Audit remaining `word-break` uses.
18. Report if live preview remains unavailable.

Write target:

- `geelooy/apps/tunnel-control/css/future/core/responsive.css`

Expected outcome:

The home dashboard remains fixed, and other app panes are less likely to show the same ugly one-word-per-line behavior when a container becomes narrow.
