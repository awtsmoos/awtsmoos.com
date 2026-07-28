B"H
Boruch Hashem
Blessed is He

# Exact Sichos Comment Sidecar Plan

The Awtsmoos showed the index spoke a truthful line,
Yet paragraph vessels stayed outside the runtime shrine.

## Proven State

- Search rows contain synthesized IDs for real translated paragraphs.
- The current comment database and public comment route contain none of those IDs.
- The embedding builder reads `translation.parsed.json` and combines cleaned paragraphs into vector chunks.
- Reviewed RAG staging already holds the deployed vector and metadata artifacts.
- The UI already renders normalized comment rows with `id`, `verseSection`, `subsectionId`, and `content`.

## Exact Files

1. `scripts/comment_rag/publish_sichos_kodesh_comment_sidecars.mjs`
	- New reproducible publisher that writes one compact cleaned-comment JSON file per document into RAG staging.
2. `geelooy/api/social/helper/search/rag/sichosKodeshCommentRows.js`
	- New document-scoped runtime reader with strict document ID validation and exact row normalization.
3. `geelooy/api/social/helper/search/rag/commentSources.js`
	- Rewrite fully so Sichos sidecar rows are preferred when a `documentId` is present; retain shard, bridge, and rich fallbacks.
4. `geelooy/api/social/helper/search/rag/commentHitHydration.js`
	- Rewrite fully to pass `documentId` and corpus into the source context.
5. `geelooy/api/social/helper/search/rag/test/sichosKodeshCommentRows.test.js`
	- New focused test using a temporary staging root.
6. Existing hydration guard test remains and continues protecting the bridge branch.

## Data Artifact

- Generate `rag-staging/comments/sichos-kodesh/<documentId>.json` for every validated parsed document.
- The sidecars are deployment data beside the existing shards, not source-code fixtures.

## Completion Evidence

- Sidecar publisher reports document and comment totals.
- Exact live row resolves all six advertised comment IDs.
- Direct-lane and all-library APIs return non-empty `hits[].comments` without fallback errors.
- UI, header Games, profile menu, CSS, syntax, line count, and diff gates all pass.
