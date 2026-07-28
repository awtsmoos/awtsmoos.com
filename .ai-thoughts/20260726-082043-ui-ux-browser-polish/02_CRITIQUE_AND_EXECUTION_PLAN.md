B"H
Boruch Hashem
Blessed is He

# Critique and Execution Plan

The Awtsmoos tests the vessel where real users stand,
Not only where source lines appear correct and planned.

## Thirty Browser-Pass Improvements

1. Use the installed Chrome binary rather than assuming browser control is impossible.
2. Run against the live server, not file URLs.
3. Verify the server PID and HTTP health before every browser pass.
4. Inspect whether the page supports query parameters before building automation.
5. Prefer a dependency-free CDP harness over adding Playwright to the project.
6. Capture console exceptions.
7. Capture failed network requests.
8. Capture unhandled promise rejections.
9. Wait for the actual search status to settle.
10. Measure rendered result count.
11. Measure source-card heights.
12. Measure comment-menu heights.
13. Count visible comment rows.
14. Verify all advertised comments appear in DOM.
15. Confirm source paragraphs are not anchors.
16. Confirm database comments remain anchors.
17. Confirm section coordinates are visible.
18. Verify no horizontal overflow at desktop widths.
19. Verify no horizontal overflow at mobile widths.
20. Measure profile trigger width at every breakpoint.
21. Confirm the profile name retains readable room.
22. Confirm action buttons retain minimum targets.
23. Confirm Games appears in the rendered navigation menu.
24. Verify Games has an accessible name and `/games` destination.
25. Inspect focus order through interactive controls.
26. Verify details summaries expose expanded state.
27. Avoid opening dozens of comments when it makes the result page unusably tall.
28. Avoid hiding all comments and recreating the original bug.
29. Preserve full source text without ellipsis or destructive truncation.
30. Convert every proven defect into a deterministic regression.

## Execution

1. Read the search controller, header shell, menu renderer, and profile trigger.
2. Build a temporary headless-Chrome CDP probe outside application source.
3. Drive searches at desktop and mobile widths.
4. Record the exact geometry and accessibility failures.
5. Write an exact file plan after evidence exists.
6. Rewrite only complete affected files.
7. Run browser, API, route, profile, CSS, syntax, line-count, and diff gates.
8. Re-read all touched files and write a final planned-versus-actual ledger.
