B"H

# Remote Texture Trust — Postwrite Delta

Boruch Hashem. Blessed is He.

The Awtsmoos revealed that the texture transport already emitted two intentional public Drive roots while its trust predicate and several tests still assumed only one. The repair aligned trust, source-path recovery, and tests with the actual transport contract rather than weakening security or reverting the original-library root.

## Source contract

`RemoteTextureTransport.js` now declares and trusts exactly the two roots it emits:
- the general `awtsmoos` public Drive root;
- the `firebase_drive_migration` original-library root used by full-resolution and tree textures.

Trust remains restricted to HTTPS on the Awtsmoos origin, rejects query/hash drift, model paths, foreign/insecure hosts, and encoded traversal, and exposes root-aware canonical source-path recovery.

`LocalMaterialTestSupport.mjs` now consumes the transport's canonical source resolver rather than slicing a single root itself. Catalog and primitive tests assert the trusted transport covenant rather than one stale root-prefix string.

## Evidence

- Focused transport/catalog/bootstrap/primitive suite: 20/20 pass.
- Village/cottage/shadow/camera/daylight suite: 26/26 pass.
- All touched hand-authored transport/test-support/test files remain <=120 lines.
- Syntax and `git diff --check` green at the repair checkpoint.
- The original `fullResolutionTextureUrl()` and `treeTextureUrl()` use of `firebase_drive_migration` was verified from pristine HEAD; the repair preserves rather than invents that architecture.

## Baseline harness distinctions

Unrelated browser/CDP fixture failures were proven present in pristine HEAD and are not texture-trust regressions. They remain separate backlog items and were not silenced under this repair.

NEXT_ACTION: audit the complete current Mac dirt, preserve any new concurrent owner changes, run one integrated local source gate across image-zero, embedded-zero, texture trust, Mitzvah owner work and repository hygiene, then checkpoint the Mac wave before merging normalized production-owner history.
