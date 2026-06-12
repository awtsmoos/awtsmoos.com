B'H
# Fix Plan: Remove Active Packed Vector Store From Comment Search

## Finding
commentAwtsmoosDbBridge imports storeCommentVector. storeCommentVector writes comment vector records through packed/socialPacked.js when AWTSMOOS_ENABLE_COMMENT_VECTORS=1. commentVectorSearch reads listCommentVectors, also backed by packed/socialPacked.js.

## Risk
Even though vectors are a sidecar, the stored value includes comment text, ids, coordinates, and metadata. Because the user explicitly prohibited packed shard mirrors, cache-backed authority, and duplicate comment storage, live comment search must not persist comment-derived rows through packed infrastructure.

## Fix
- Rewrite commentAwtsmoosDbBridge.js to stop importing commentVectorStore and never write packed vectors.
- Rewrite commentVectorSearch.js to query only searchCommentSearchRecords from the AwtsmoosDB comment-search sidecar.
- Keep vector endpoints operational as sidecar search responses with metadata explaining vectors are disabled to preserve single authority.
- Leave commentVectorStore.js inert unless later explicitly removed; ensure no active imports remain.

## Verification
- rg storeCommentVector/listCommentVectors/commentVectorStore from active files.
- syntax checks.
- run route tests.

Chapter 3: The Star That Became Too Heavy
A vector was a star, but it carried the whole comment in its pocket. The Awtsmoos whispered through the directory wind: 'Light may guide, but it may not become another throne.' So the star was made a sign, not a storehouse.
