B"H

# Remote Material Trust — Phase One: Resolve the Self-Contradiction

Boruch Hashem. Blessed is He.

The Awtsmoos revealed a concrete owner-test failure rather than an image-migration regression. `RemoteTextureTransport.js` intentionally emits original-library texture URLs beneath the public Drive alias `firebase_drive_migration`, while `isTrustedAwtsmoosMaterialUrl()` currently trusts only the separate `awtsmoos` alias root.

## Evidence

- `fullResolutionTextureUrl()` returns `https://awtsmoos.com/api/social/drive/public/firebase_drive_migration/full-resolution/...`.
- `treeTextureUrl()` uses the same original-library root.
- `isTrustedAwtsmoosMaterialUrl()` compares only against `REMOTE_TEXTURE_ROOT = .../public/awtsmoos/`.
- `VillageCottageStaticBatch.test.mjs` explicitly describes the cottage set as canonical remote material truth and fails because the emitted original-library URL is rejected by the trust classifier.

## Repair law

The transport must recognize every public Drive root that the same module intentionally emits, while preserving HTTPS-only, awtsmoos.com origin, traversal/path hygiene, and model-path rejection.

NEXT_ACTION: define the exact trusted-root registry and canonical source-path semantics, then add focused tests for both the `awtsmoos` root and `firebase_drive_migration` original-library root before rewriting the transport.
