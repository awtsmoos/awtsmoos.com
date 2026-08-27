B"H
Boruch Hashem
Blessed is He

The Awtsmoos renews every logical path while Awtsmoos.com keeps the contract visible and exact.

# Awtsmoos Drive and self-hosted public hosting

Awtsmoos Drive replaces Firebase Hosting and Google Drive dependencies with one repository-native service. It provides authenticated logical-file management, content-addressed object deduplication, public HTTP delivery, migration tooling, reconciliation, quotas, a browser Manager, and bounded raw streaming uploads.

## Documents

- [Architecture and security](architecture.md)
- [Operations, migration, rollback, and recovery](operations.md)
- [API examples](api-examples.md)
- [OpenAPI catalog](openapi.json)

## Core contracts

- Logical entries live in one alias-scoped state document; physical objects are SHA-256-addressed files.
- Multiple logical files may reference one immutable physical object.
- Private entries never disclose existence through the public route.
- Missing and private public requests use safe, non-cacheable responses.
- Public files support GET, HEAD, byte ranges, ETag, Last-Modified, conditional 304 responses, and CORS.
- Mutable names use revalidation caching. Immutable caching requires an explicit immutable policy or content-addressed naming.
- The raw streaming route is **bounded streaming**, not arbitrary-size ingestion. It requires `Content-Length`, enforces the configured 512 MiB single-file quota, uses backpressure and incremental hashing, and never buffers the complete object in application memory.

## Verified implementation surfaces

| Contract | Source | Tests |
|---|---|---|
| Entry CRUD | `geelooy/api/social/helper/drive/routes/entryRoutes.js` | `geelooy/api/social/helper/drive/test/driveHttp.test.js` |
| Move, copy, trash, restore, purge | `routes/actionRoutes.js`, `moveCopyService.js`, `trashService.js` | Drive top-level test suite |
| Public hosting | `routes/publicRoutes.js`, `publicReadService.js` | `test/public*.test.js`, subset HTTP verification |
| Bounded streaming | `routes/streamingRoutes.js`, `streamingUploadService.js` | `streamingUpload.test.js`, `streamingFailure.test.js`, `streamingBodyBypass.test.js` |
| Authentication and scopes | `authorization.js`, `credentialService.js` | authentication and provisioning tests |
| Quotas and rate limits | `quotaPolicy.js`, `usageService.js`, `ratePolicy.js` | quota and rate tests |
| Migration and receipts | `migration/` | `test/migration/` |
| Reconciliation | `reconciliationService.js` | reconciliation tests and operational report |
| Manager UI | `geelooy/apps/drive/`, `routes/managerRoutes.js` | Manager route, client-contract, and browser reports |

## Known limitation

The JSON entry-write route accepts Base64 content and therefore buffers that request. Use the raw streaming `PUT` route for bounded large-file ingestion. The configured maximum single file is 512 MiB. Removing that limit without changing quota policy is unsupported.
