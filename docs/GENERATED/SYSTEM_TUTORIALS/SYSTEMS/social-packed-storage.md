B"H
Boruch Hashem
Blessed is He

# System Tutorial: Social Packed Storage

**District:** data · **System ID:** `social-packed-storage`

Packed Social persistence, bridges, shards, snapshots, and migration helpers used around posts/comments/series.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Packed-engine files show implementation families; logical Social semantics still belong to Social handlers and manuals.

## Change risk

Shard, manifest, snapshot, or migration changes can affect existing Social content.

## Human manuals

- [docs/DATA/README.md](../../../DATA/README.md)
- [docs/DATA/PATH_CONTRACTS.md](../../../DATA/PATH_CONTRACTS.md)

## Related project boundaries

- `geelooy/api/social` (api) — geelooy/api/social

## Source anchors

- `geelooy/api/social/_awtsmoos.packed.js`
- `geelooy/api/social/helper/packed/socialPacked.js`
- `geelooy/api/social/helper/packed/awtsmoosDbFsBridge.js`

## Generated evidence

- [docs/GENERATED/PROJECT_TUTORIAL_INDEX.md](../../PROJECT_TUTORIAL_INDEX.md)

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTS_DB_ROOT` | path/storage | 3 | `geelooy/api/social/helper/search/rag/paths.js; geelooy/api/social/helper/search/rag/test/catalogAndSidecar.test.js; geelooy/api/social/helper/search/rag/test/liveSearchProbe.js` |
| `AWTS_RAG_SEMANTIC_WARMUP` | runtime-config | 2 | `geelooy/api/social/helper/search/rag/ragStartupWarmup.js; geelooy/api/social/helper/search/rag/test/ragStartupWarmup.test.js` |
| `AWTS_RAG_STARTUP_WARMUP` | runtime-config | 2 | `geelooy/api/social/helper/search/rag/ragStartupWarmup.js; geelooy/api/social/helper/search/rag/test/searchContracts.test.js` |
| `AWTSMOOS_AI_ROOT` | path/storage | 1 | `geelooy/api/social/helper/search/rag/paths.js` |
| `AWTSMOOS_ALLOW_LEGACY_RICH_MIGRATION` | runtime-config | 2 | `geelooy/api/social/helper/comments/richDb/PackedStoreGuard.js; geelooy/api/social/helper/comments/test/legacyMigrationGuard.test.js` |
| `AWTSMOOS_BGE_MODEL_PATH` | path/storage | 1 | `geelooy/api/social/helper/search/rag/bgeRuntime.js` |
| `AWTSMOOS_BGE_PYTHON` | runtime-config | 1 | `geelooy/api/social/helper/search/rag/bgeRuntime.js` |
| `AWTSMOOS_BOOK_EXPORT_ROOT` | path/storage | 2 | `geelooy/api/social/helper/books/paths.js; geelooy/api/social/helper/books/test/bookResilience.test.js` |
| `AWTSMOOS_BROWSER_ALLOW_NO_SANDBOX` | runtime-config | 1 | `geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.js` |
| `AWTSMOOS_BROWSER_HEADLESS` | runtime-config | 2 | `geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.js; geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.test.js` |
| `AWTSMOOS_BROWSER_PROFILE_ROOT` | path/storage | 1 | `geelooy/api/social/helper/drive/browser/interactiveProfileStore.js` |
| `AWTSMOOS_BULK_IMPORT_KEY` | secret-name | 1 | `geelooy/api/social/helper/routes/packed/bulkImportRoutesClass.js` |
| `AWTSMOOS_DATA_ROOT` | path/storage | 1 | `geelooy/api/social/helper/safeguards/shapeAudit.js` |
| `AWTSMOOS_DBROOT` | path/storage | 10 | `geelooy/api/social/helper/routes/packed/bulkImportRoutesClass.js; geelooy/api/social/helper/routes/packed/bulkImportRoutesGuards.js; geelooy/api/social/helper/routes/packed/bulkPublishAllRoutesPaths.js` |
| `AWTSMOOS_DEPLOY_KEY` | secret-name | 1 | `geelooy/api/social/helper/routes/packed/bulkImportRoutesClass.js` |
| `AWTSMOOS_DRIVE_ADMIN_USER_IDS` | runtime-config | 1 | `geelooy/api/social/helper/drive/adminAuthorization.js` |
| `AWTSMOOS_ENABLE_COMMENT_BREADCRUMB_INDEX` | path/storage | 1 | `geelooy/api/social/helper/comments/creation/HodAliasCommentIndex.js` |
| `AWTSMOOS_GIT_BIN` | runtime-config | 1 | `geelooy/api/social/helper/repositories/gitProcess.js` |
| `AWTSMOOS_GIT_HTTP_BACKEND` | runtime-config | 1 | `geelooy/api/social/helper/repositories/gitProcess.js` |
| `AWTSMOOS_IMPORT_KEY` | secret-name | 3 | `geelooy/api/social/helper/routes/packed/authCoreMixin.js; geelooy/api/social/helper/routes/packed/notesMixin.js; geelooy/api/social/helper/routes/packed/submissionsMixin.js` |
| `AWTSMOOS_IMPORT_LANES` | runtime-config | 2 | `geelooy/api/social/helper/routes/packed/importLaneScheduler.integration.test.cjs; geelooy/api/social/helper/routes/packed/importLaneScheduler.js` |
| `AWTSMOOS_IMPORT_WORKERS` | runtime-config | 1 | `geelooy/api/social/helper/routes/packed/runJobContext.js` |
| `AWTSMOOS_IMPORTED_COMMENT_DATA_ROOT` | path/storage | 3 | `geelooy/api/social/helper/comments/imported/bundleStoreRead.js; geelooy/api/social/helper/comments/test/richImportedRoute.test.js; geelooy/api/social/helper/comments/test/translationBundles.test.js` |
| `AWTSMOOS_LEXICON_ROOT` | path/storage | 5 | `geelooy/api/social/helper/search/lexicon/paths.js; geelooy/api/social/helper/search/lexicon/test/browse.test.js; geelooy/api/social/helper/search/lexicon/test/builder.test.js` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

None observed for this system packet.

## Tags

`persistence` · `social` · `packed` · `migration`
