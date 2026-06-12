B"H

# Phase Three: Final Plan and Improvements

Thirty final improvements collapsed into one practical revelation:

1. Do not alter HTML because the data-driven render is fine.
2. Do not modify shell CSS because the sidebar/main layout is behaving as designed.
3. Do not weaken all overflow safeguards; they prevent real horizontal bugs elsewhere.
4. Fix the real collapsed header grid.
5. Make dashboard header rows explicit.
6. Keep metrics full width.
7. Keep paragraph readable.
8. Keep title from occupying an auto column.
9. Keep kicker from sharing a row with title unless intentionally nested.
10. Avoid `word-break` changes for the whole app.
11. Keep responsive card grid.
12. Preserve the action-card hover language.
13. Preserve icon color groups.
14. Preserve page controls.
15. Preserve section titles.
16. Make mobile behavior simpler.
17. Keep no file over a reasonable size.
18. Rewrite a complete file only.
19. Verify with file readback.
20. Verify CSS has selectors required by dashboard renderer.
21. Verify `.awt-dashboard-head` no longer uses an unassigned two-column auto trap.
22. Avoid command-side destructive actions.
23. Keep all work inside approved root.
24. Respect CSS cascade layers.
25. Keep imports unchanged.
26. Keep JSDoc-style poetic CSS comments but not so much that the file becomes unstable.
27. Make the repair robust at the screenshot width.
28. Make the repair robust at large desktop widths.
29. Make the repair robust below 760px.
30. Report exact file changed and exact reason.

Final actual touched code file:

- `geelooy/apps/tunnel-control/css/future/views/dashboard.css`

Final implementation: rewrite that complete CSS file so the dashboard header uses named areas and metrics cannot compress the copy into a one-word column.
