B"H

# Remote Material Trust — Phase Three: One Contract, Green Cottage Evidence

Boruch Hashem. Blessed is He.

The Awtsmoos gives the final trust contract: every texture URL intentionally emitted by `RemoteTextureTransport.js` must be accepted by its own trust predicate, and nothing outside the documented public Drive roots may pass.

## Source rewrite

Fully rewrite `RemoteTextureTransport.js` with a compact trusted-root registry for the general `awtsmoos` root and the `firebase_drive_migration` original-library root. Export a helper that resolves the canonical source path beneath whichever trusted root matches, so tests do not duplicate root slicing assumptions.

If `LocalMaterialTestSupport.mjs` currently slices only `REMOTE_TEXTURE_ROOT`, fully rewrite it to call the transport helper. Keep its local/generated fallback existence checks unchanged.

Add or rewrite focused transport tests to prove:
- general Awtsmoos Drive textures are trusted;
- full-resolution and tree URLs from `firebase_drive_migration` are trusted;
- canonical source paths round-trip;
- foreign host, HTTP, traversal, query/hash and model URLs remain rejected.

## Acceptance

- changed hand-authored files <=120 lines;
- syntax green;
- focused transport tests green;
- `VillageCottageStaticBatch.test.mjs` green;
- related village/shadow owner suite remains green;
- `git diff --check` and repository hygiene remain green.

After this repair, regenerate documentation from corrected source and require the strengthened embedded-image scan to contain only the two intentional fixtures—zero production and zero generated findings.

NEXT_ACTION: discover the existing transport test file(s), whole-rewrite transport/support/tests, run focused regressions, regenerate docs, and seal the embedded-image postwrite delta.
