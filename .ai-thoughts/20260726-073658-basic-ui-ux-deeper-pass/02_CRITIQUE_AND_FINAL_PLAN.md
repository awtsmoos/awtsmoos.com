B"H
Boruch Hashem
Blessed is He

# Critique and Final Plan

The Awtsmoos asks not whether code appears complete,
But whether every returned spark can reach the reader's seat.

## Thirty Improvements and Checks

1. Inspect live payloads instead of inferring them from server modules.
2. Sample multiple queries because one term may return no comments.
3. Record exact parent and source coordinate fields.
4. Treat numeric and string coordinates as equivalent.
5. Require post identity before segment identity.
6. Avoid broad title-only matching.
7. Preserve already hydrated comments.
8. Deduplicate by stable row or provenance ID.
9. Keep comments with missing IDs by deriving a conservative content key.
10. Track which ranked comments were consumed.
11. Return unmatched comments explicitly.
12. Never silently discard malformed comment hits.
13. Render unmatched comments only when useful source context exists.
14. Reuse existing comment item rendering.
15. Reuse existing safe-markup sanitization.
16. Keep DOM insertion free from raw unsanitized server HTML.
17. Announce total shown comments accurately.
18. Distinguish attached and standalone ranked comments in status copy.
19. Keep source cards readable when many comments exist.
20. Preserve keyboard-operable native details controls.
21. Keep empty comment menus absent from focus order.
22. Verify RTL and mixed-language text remain untouched.
23. Inspect desktop and mobile profile rules together.
24. Keep profile text ellipsis behavior intact.
25. Ensure wider profile still allows action shrink.
26. Verify Games uses the canonical route source.
27. Add pure-data tests for unmatched and malformed comments.
28. Add source-text contract tests for visible standalone rendering.
29. Run existing header, profile, CSS, and diff gates.
30. Smoke the live page and API after implementation.

## Final Execution Sequence

1. Query the live API with a search-term matrix and capture the first real comment hit.
2. Compare actual parent fields against source hit rows.
3. Read comment item rendering and relevant CSS completely.
4. Write an exact file plan based on observed data.
5. Rewrite complete files only.
6. Run syntax and focused tests.
7. Run existing regression suites.
8. Perform live HTTP/API smoke checks.
9. Re-read touched files and write the planned-versus-actual delta.
