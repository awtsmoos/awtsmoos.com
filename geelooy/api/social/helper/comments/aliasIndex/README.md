# B"H — Comment Alias Index (geelooy/api/social/helper/comments/aliasIndex/)

Packed index mapping aliases to their comments, so "comments made by alias X" queries are fast.

## Files
- `IndexCodec.js` — encodes/decodes index records.
- `IndexQueries.js` — query interface over the index.
- `PackedIndexStore.js` — persistent packed storage for the index.

## What it does
Maintains a compact, queryable index of which comments belong to which alias, backing the `/aliases/:alias/commentsMade` route family.
