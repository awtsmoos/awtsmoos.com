B"H

# Next pass after full split

The split exists and tests pass, but the next highest-risk work is not glamour. It is compatibility and hidden import fallout.

Risk list:
1. Some templates may still link legacy /style/social/home.css, bypassing home/index.css.
2. Existing home.css remains large and stale, so future edits may accidentally happen there.
3. Legacy reader files with fixed 100vh are no longer in main import graph, but direct imports could still reach them.
4. Heichel old visual-polish compatibility file imports split modules; ok, but index does not need it.
5. post template still cache-bumps postLogic as eager-verses-299 not split-001; safe but confusing.
6. app.js cache remains modal-scroll-299 not split-001; safe but confusing.
7. Diagnostics use data-ref selectors, but the renderer may not emit data-ref. Need verify DOM builder behavior.
8. The diagnostic tests stub data-ref, so they do not prove real renderer refs.
9. Need search for stale visual-303 and home.css direct links.
10. Need make compatibility wrappers for old CSS paths if used.

Concrete next actions:
- grep for stale links and visual versions.
- inspect DOM builder for data-ref behavior.
- add compatibility home.css as import wrapper to home/index.css.
- cache-bump app.js and postLogic script URLs to split-001.
- add a test for stale visual-303 and required entry references.
- rerun full tests and live routes.
