B"H

# More Potential Issues Brainstorm

The first fix repaired the visible dashboard header collapse. The next pass must search for adjacent layout traps instead of assuming completion.

Potential issue classes to hunt:

1. Any CSS rule using `grid-template-columns: ... auto` with multiple direct children and no explicit grid placement.
2. Any full app overflow rule that forces readable prose into `word-break: break-word` or `overflow-wrap:anywhere` too broadly.
3. Any responsive breakpoint that contradicts the dashboard grid repair.
4. Any dashboard card text hidden too aggressively on medium desktop.
5. Any sidebar width and main panel combination that causes horizontal scroll near 900-1120px.
6. Any imported CSS module later in the same layer that overrides dashboard rules.
7. Any JS boot repair script that injects inline CSS or stale classes.
8. Any stale generated CSS or duplicate file outside `future/views/dashboard.css` that still contains the old broken layout.
9. Any layout surfaces using title/copy/metrics patterns with the same two-column auto trap.
10. Any CSS syntax edge caused by the rewrite.

Concrete action plan:

- Search CSS for `grid-template-columns` with `auto`.
- Search CSS for `overflow-wrap: anywhere` and `word-break` broad selectors.
- Read dashboard pager/card sections to make sure class names still align.
- Inspect shell, pro-control, workspace, gate modules for later overrides or repeated header traps.
- Run a static CSS audit script for suspicious selectors and braces.
- If needed, rewrite additional complete small CSS modules only.
- Verify again.
