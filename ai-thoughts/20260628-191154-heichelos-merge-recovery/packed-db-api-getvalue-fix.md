B"H
# Packed AwtsDB API getValue Fix

Evidence:
- API and DosDB can list Likkutei Sichos volume post IDs.
- `db.get(path, { propertyMap: { [postId]: true } })` returns full post objects.
- `db.getObjectKey(path, postId)` returns full post objects.
- `db.getValue(path, postId)` returns null because DosDB/index.js never wrapped getValue during the AwtsmoosDB FS router migration.
- Social post API routes call `$i.db.getValue(...)`, so single post/details routes fail even though compacted DB data exists.

Plan:
1. Rewrite DosDB/index.js fully, preserving current behavior and adding legacy.getValue to the captured legacy method bag.
2. Add a routed/cached `this.getValue(id, key, map)` wrapper that first asks the AwtsmoosDB FS router getObjectKey, then falls back to `this.get(id, { propertyMap: { [key]: map || true } })`, then to legacy.getValue.
3. Restart the 8080 server so the new DosDB wrapper is loaded.
4. Verify through direct DosDB and HTTP API.
