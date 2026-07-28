B"H
Boruch Hashem
Blessed is He

# Critique and Improvements

The Awtsmoos tests each vessel before its light is shown;
A plan must face its shadows before it stands alone.

## Twenty Improvements to the First Plan

1. Confirm which repository root actually serves the UI.
2. Read nested AGENTS files before selecting targets.
3. Find all dropdown implementations to avoid editing a dead surface.
4. Trace `/games` route existence before adding navigation.
5. Preserve icon and label conventions used by sibling menu entries.
6. Check keyboard and screen-reader behavior of the dropdown.
7. Trace search data from request through normalization to rendering.
8. Inspect real comment payloads rather than guessing field names.
9. Support the exact existing data shape before adding fallbacks.
10. Avoid unsafe raw HTML unless the project already sanitizes it.
11. Preserve Hebrew directionality and mixed-language rendering.
12. Hide empty or whitespace-only comments.
13. Check whether comments are arrays, objects, or plain strings.
14. Reuse existing result-card typography and spacing tokens.
15. Verify profile width at desktop, tablet, and mobile breakpoints.
16. Inspect flex shrink and overflow behavior around the profile bar.
17. Avoid forcing a width that clips adjacent navigation items.
18. Add focused regression coverage instead of broad unrelated refactors.
19. Run the project’s own lint, syntax, test, and build scripts.
20. Re-read full touched files and record planned-versus-actual delta.

## Risk Graph

- Dropdown source -> route contract -> navigation regression.
- Search response -> normalization -> comments renderer -> content safety.
- Profile width -> flex container -> responsive overflow.
- Full-file rewrite -> public exports -> downstream consumers.

## Improved Decision

Use the smallest number of complete-file rewrites that satisfy all three outcomes. Extract a helper only when the real comment data proves the renderer would otherwise become tangled.
