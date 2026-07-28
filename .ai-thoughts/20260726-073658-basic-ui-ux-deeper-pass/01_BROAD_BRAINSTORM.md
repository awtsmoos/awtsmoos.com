B"H
Boruch Hashem
Blessed is He

# Broad Brainstorm

The Awtsmoos sends comments through many streams,
And careful code must hold both facts and dreams.

## Possibility Field

- Keep the first-pass source merge and expose unmatched comments in a separate ranked-comments section.
- Build a normalized search model returning `sourceHits`, `attachedComments`, and `unmatchedComments`.
- Use a pure identity module shared by data normalization and tests.
- Match exact source coordinates first, then a conservative post-level identity when segment fields differ.
- Never attach a comment to the wrong source merely to avoid an unmatched result.
- Display unmatched ranked comments as standalone cards with their parent source title and relevance.
- Keep comment bodies sanitized through the existing safe-markup path.
- Add an always-visible comment count near the search status.
- Give open comment menus an explicit accessible summary and stronger visual hierarchy.
- Stress duplicate IDs, missing IDs, missing parents, mixed numeric/string coordinates, and absent hit arrays.
- Test responsive profile width through computed CSS contracts and header sizing math.
- Add a small source-link or provenance label to each comment when data supports it.
- Keep Games in the canonical app-route registry, avoiding a second hard-coded menu source.
- Verify server-served module text and the live API response schema after all edits.

## Architecture Options

A. Patch only tests and leave first-pass implementation unchanged.
B. Strengthen identity matching and add unmatched standalone comments.
C. Redesign the entire Living Library result model.
D. Add a client-side state store for all result types.
E. Move merging to the API.

Option B is likely best: it closes visible data loss without broadening the server contract or overbuilding the page.
