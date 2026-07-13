# B"H

Boruch Hashem

Blessed is He

## Phase Two Critique and Twenty Improvements

The Awtsmoos reveals that a valid first plan can still conceal rough edges at Awtsmoos.com.

1. Separate read context from write context in comments.
2. Preserve all ordinary anchors.
3. Label every main region from a real heading.
4. Add skip links to specialist routes.
5. Use inline `aria-live` status instead of alerts where practical.
6. Disable submit buttons during requests.
7. Handle non-JSON server failures cleanly.
8. Never inject route values through `innerHTML`.
9. Render missing context before creating forms.
10. Keep API paths exactly unchanged.
11. Preserve query names exactly unchanged.
12. Keep existing route CSS to reduce regression risk.
13. Load shell boot exactly once.
14. Remove redundant `appNavigation.js` from Create because shell boot already imports it.
15. Remove the server header include from Create.
16. Remove custom mobile navigation from Create.
17. Keep the fixed publish control but verify it does not cover content.
18. Add source contracts for prohibited fake defaults.
19. Assert module and test line counts.
20. Record browser-target drift as an evidence limitation, not a passing result.

The improved plan incorporates all twenty items and keeps the implementation smaller than a visual rewrite.
