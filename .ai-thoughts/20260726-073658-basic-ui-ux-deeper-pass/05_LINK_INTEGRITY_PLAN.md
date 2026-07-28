B"H
Boruch Hashem
Blessed is He

# Link Integrity Plan

The Awtsmoos showed a final doorway painted bright,
Yet sidecar IDs had no database destination in sight.
A truthful interface must never promise a road,
When the paragraph itself is the complete revealed load.

## Evidence

- Sidecar paragraph IDs are synthesized for the search index.
- The canonical comments route returns no database record for those IDs.
- `rangeComments.js` currently creates an anchor whenever any row has an ID.
- Therefore sidecar paragraphs would display correctly but link to a comment target that cannot resolve.

## Exact Repair

1. Rewrite `geelooy/mawgawl/sefarim/rangeComments.js`.
	- Real database comments remain anchors.
	- `sichosKodeshDocumentSidecar` rows become semantic non-clickable articles.
	- Coordinates show both section and paragraph when both exist.
	- Static rows receive an explicit `Source text` label instead of an outbound arrow.
2. Rewrite `geelooy/mawgawl/sefarim/styles/comments.css`.
	- Style static rows honestly without hover-link affordance.
	- Preserve all current keyboard and contrast behavior for real links.
3. Add `tests/livingLibraryCommentPresentation.test.mjs`.
	- Guard static sidecar presentation, exact coordinate formatting, and real-comment link preservation.
4. Re-run UI, CSS, live API, line-count, and diff gates.
