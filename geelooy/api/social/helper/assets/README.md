# B"H — Assets (geelooy/api/social/helper/assets/)

Asset upload, storage, manifesting, and access control for social content (post attachments, editor uploads, private-message media).

## Key files
- `assetUpload.js`, `multipart.js` — multipart upload handling.
- `assetCopy.js`, `assetCopySource.js` — copy assets between sources.
- `assetManifest.js`, `assetPaths.js`, `privateMessageAssetManifestSource.js` — manifest tracking and path resolution.
- `assetPolicy.js`, `assetRateLimit.js` — upload policy and per-user rate limiting.
- `assetBindings.js` — binds assets to comment/post sections.
- `publicAssetAccess.js` vs `privateMessageAssetAccess.js` (+ proofs: `privateMessageAssetProof.js`, `privateMessageImageAssetAccess`) — public access layer and gated private-message access with image-manifest proofs.
- `test/` — copy/binding test vessels and suites.

## What it does
Handles the full asset lifecycle: parse uploads, enforce policy and rate limits, record manifests, and serve assets — with a strict split between public assets and private-message assets, which require access proofs.
