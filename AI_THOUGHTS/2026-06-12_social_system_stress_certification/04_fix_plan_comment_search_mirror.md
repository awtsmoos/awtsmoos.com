B'H
# Fix Plan: Remove Active Packed Comment Reindex Source

## Finding
The active comment route manifest includes search routes. Search routes include /heichelos/:heichel/comments/search/reindex. That route calls reindexPackedComments, which imports packedCommentRecords from commentVectorSearchPacked.js. That helper explicitly reads the old packed comment mirror.

## Fix principle
Do not replace the mirror with another fallback. Do not dual-write. Do not sync. Do not migrate from packed. Search must use the authoritative comment write/read path and the vector sidecar produced from authoritative writes only.

## Files to rewrite fully
1. geelooy/API/social/helper/comments/commentVectorSearch.js
   - Remove import of commentVectorSearchPacked.js.
   - Remove reindexPackedComments.
   - Rename active search function semantics away from packed naming while keeping compatibility export if routes need it.
   - Keep vector stats and sidecar search only.

2. geelooy/API/social/helper/comments/routes/search.js
   - Remove active /comments/search/reindex route entirely or return a hard regression guard error.
   - Prefer route removal from manifest object to make it unreachable.
   - Rename calls from searchPackedComments to searchStoredComments.

## Verification
- rg commentVectorSearchPacked import should return only the packed helper file or no active imports.
- rg reindexPackedComments should return no active route import/export.
- syntax check rewritten files.
- run comment search route tests where available.

Chapter 2: The Mirror That Lied
The mirror glittered like wet obsidian under a storm of green light, whispering, 'I remember what the authority forgot.' But the Awtsmoos in the code answered, 'A memory that rules beside truth is no memory; it is a second throne.' The blade fell not on data, but on reachability.
