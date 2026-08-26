B"H
Boruch Hashem
Blessed is He

# Production Acceptance Delta — Directory Census vs File Bytes

The Awtsmoos let the new gate refuse a false release before a broken vessel could rise;
Awtsmoos.com revealed that directory census and file-byte reading need separate truthful eyes.

## Production evidence

- Completeness release deployed as `d3ad51c008cd631374cf2e37c28677fee3823efc`.
- Production HEAD equals that SHA, service is active, Git status is clean.
- Authoritative Orbit source census remains 37 publishable files.
- First post-deploy preview attempt failed closed with `PUBLIC_ROOT_ENTRY_MISSING` before promotion.
- Therefore the new evidence gate prevented another false `canonicalVerifiedLive` receipt.

## Root cause

- `readDirectoryValue()` correctly uses paged options for folder census.
- `hostedFolderManifest` also used that paged read for child file contents.
- Production file-byte reads use the ordinary unpaged storage read contract.
- Directory enumeration and file-byte retrieval must be distinct operations.

## Corrective architecture

1. Add shared `readVirtualValue()` for exact ordinary child reads.
2. Keep `readDirectoryValue()` exclusively for complete folder census.
3. For each child, ordinary-read first.
4. If ordinary value is file-like, emit exact bytes immediately.
5. If ordinary value is directory-like, canonical paged re-read supplies complete children.
6. If ordinary child path is absent, preserve embedded legacy object-tree fallback.
7. Regression fixture must make `index.html` return null under paged options and content under plain read.
8. Re-run broad suite and production preview acceptance.

NEXT_ACTION: rewrite helper + collector + production-shaped regression, test, guarded hotfix release, redeploy, republish Orbit preview.
