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
| `AWTS_RAG_STARTUP_WARMUP` | runtime-config | 2 | `geelooy/api/social/helper/search/rag/ragStartupWarmup.js; geelooy/api/social/helper/search/rag/test/searchContracts.test.js` |
| `AWTSMOOS_AI_ROOT` | path/storage | 1 | `geelooy/api/social/helper/search/rag/paths.js` |
| `AWTSMOOS_BOOK_EXPORT_ROOT` | path/storage | 2 | `geelooy/api/social/helper/books/paths.js; geelooy/api/social/helper/books/test/bookResilience.test.js` |
| `AWTSMOOS_BROWSER_ALLOW_NO_SANDBOX` | runtime-config | 1 | `geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.js` |
| `AWTSMOOS_BROWSER_HEADLESS` | runtime-config | 2 | `geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.js; geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.test.js` |
| `AWTSMOOS_BROWSER_PROFILE_ROOT` | path/storage | 1 | `geelooy/api/social/helper/drive/browser/interactiveProfileStore.js` |
| `AWTSMOOS_DB_PATH` | path/storage | 1 | `geelooy/api/social/helper/series/directSeriesPrateem.js` |
| `AWTSMOOS_DRIVE_ADMIN_USER_IDS` | runtime-config | 1 | `geelooy/api/social/helper/drive/adminAuthorization.js` |
| `AWTSMOOS_ENABLE_COMMENT_BREADCRUMB_INDEX` | path/storage | 1 | `geelooy/api/social/helper/comments/commentCreation.js` |
| `AWTSMOOS_GIT_BIN` | runtime-config | 1 | `geelooy/api/social/helper/repositories/gitProcess.js` |
| `AWTSMOOS_GIT_HTTP_BACKEND` | runtime-config | 1 | `geelooy/api/social/helper/repositories/gitProcess.js` |
| `AWTSMOOS_IMPORTED_COMMENT_DATA_ROOT` | path/storage | 3 | `geelooy/api/social/helper/comments/imported/bundleStore.js; geelooy/api/social/helper/comments/test/richImportedRoute.test.js; geelooy/api/social/helper/comments/test/translationBundles.test.js` |
| `AWTSMOOS_LIKKUTEI_SICHOS_RAG_ROOT` | path/storage | 1 | `geelooy/api/social/helper/search/rag/paths.js` |
| `AWTSMOOS_PUBLIC_ORIGIN` | runtime-config | 3 | `geelooy/api/social/helper/drive/siteCanonicalUrl.js; geelooy/api/social/helper/repositories/gitCloneService.js; geelooy/api/wallet/routes/paypalCreate.js` |
| `AWTSMOOS_RAG_ROOT` | path/storage | 1 | `geelooy/api/social/helper/search/rag/paths.js` |
| `AWTSMOOS_REAL_SMOKE_DEBUG` | test/tuning | 1 | `geelooy/api/social/helper/apiKeys.js` |
| `AWTSMOOS_SICHOS_KODESH_RAG_ROOT` | test/tuning | 1 | `geelooy/api/social/helper/search/rag/test/sichosKodeshCommentRows.test.js` |
| `AWTSMOOS_SOCIAL_AWTSDB` | test/tuning | 2 | `geelooy/api/social/helper/assets/test/assetCopy.test.mjs; geelooy/api/social/helper/awtsmoosDb/test/shardStore.test.js` |
| `AWTSMOOS_TANACH_EMBED_PYTHON` | runtime-config | 1 | `geelooy/api/social/helper/search/rag/multilingualEmbedder.js` |
| `AWTSMOOS_TANACH_INDEX` | path/storage | 3 | `geelooy/api/social/helper/search/rag/storageInvariant.js; geelooy/api/social/helper/search/rag/test/storageInvariant.test.js; geelooy/api/social/helper/search/tanach/paths.js` |
| `AWTSMOOS_TANACH_MODEL_PATH` | path/storage | 1 | `geelooy/api/social/helper/search/rag/multilingualEmbedder.js` |
| `CHROME_PATH` | path/storage | 1 | `geelooy/api/social/helper/drive/browser/interactiveChromeLauncher.js` |
| `EXACT_HEBREW_INDEX_DB` | path/storage | 1 | `geelooy/api/social/helper/search/exactHebrewPaths.js` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

None observed for this system packet.

## Tags

`persistence` · `social` · `packed` · `migration`
