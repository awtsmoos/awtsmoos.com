# B"H — Comments (geelooy/api/social/helper/comments/)

The complete comment subsystem: creation, retrieval, moderation, reactions, trees, aliases, translations, imported corpora, and storage bridges (legacy folders, AwtsmoosDB, packed shards).

## Subdirectories
- `routes/` — HTTP route handlers (see its README for the full endpoint list).
- `creation/` — sephirah-named comment-creation pipeline (input, authority, identity, bulk service, coordinator).
- `query/` — read/query service (`TiferesCommentQueryService`, read context).
- `aliasIndex/` — alias→comment packed index.
- `richDb/` — rich-comment packed store.
- `imported/` — imported corpora (Meluket, Sichos Kodesh) with adapters, registry, orchestrator, and 500+ post JSONs under `data/`.
- `translations/` — comment translation catalog/coverage/reader/search.
- `scripts/` — one-off migrations (legacy → new system, old comments → AwtsmoosDB).
- `test/` — full comment test suite (creation, indexing, search, translation, migration, policy).

## Key files
- `index.js` — public module surface (used by `helper/index.js`).
- `commentCreation.js`, `commentDeletion.js`, `commentModeration.js`, `commentModification.js` — mutation operations.
- `commentRetrieval.js`, `commentReadCore/Report/Sources/Utils` — read path.
- `commentReactions.js`, `commentActivity.js` — reactions and activity.
- `richComment*.js` (Access/Create/Delete/Mutation/Ownership/Paths) — rich comment store.
- `commentShard*.js` (Bridge/Reader/Rows/Worker) — shard storage layer.
- `commentAwtsmoosDbBridge.js`, `commentMigration.js`, `commentMigrationDiscovery.js` — AwtsmoosDB migration.
- `commentVectorSearch*.js`, `commentVectorStore.js` — vector search over comments.
- `canonicalCommentSource.js`, `databaseCommentSource.js`, `importedCommentTree.js`, `commentPaths.js`.
