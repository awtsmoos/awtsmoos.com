B'H
# Full Class Coverage Plan

The user now asks for a stricter guarantee: every potential CSS class that any heichelos/post/home page can add must be styled, and not one element should lack styles.

Honest interpretation:
- It is impossible to prove for the entire universe of dynamic runtime strings without a class inventory from the actual source tree.
- It is possible to build a strict static coverage scanner for the relevant heichelos/home source: collect literal class names from HTML, JS blueprint objects, className strings, classList usage, query selectors, and CSS selectors; then report uncovered emitted classes.
- It is also possible to add a generic component-safety base layer so normal elements, buttons, links, inputs, cards, menus, drawers, viewports, and loading/error states have default styling even when a specific class is missed.

Phase 1:
- Generate inventory for geelooy/heichelos, geelooy/style/heichelos, geelooy/index.html, geelooy/style/social/home, geelooy/scripts/awtsmoos/social/home.
- Separate emitted classes from CSS-only classes.
- Identify emitted classes lacking a matching selector.

Phase 2:
- Add a reusable fallback safety stylesheet to post reader, heichel mobile, and home/social areas where necessary.
- Prefer styling actual missing classes over blanket div styling.
- Ensure all files remain under 120 lines where newly touched.

Phase 3:
- Add tests so class coverage stays true.
- Run post/heichel/home tests, CSS quality, and server token checks.
