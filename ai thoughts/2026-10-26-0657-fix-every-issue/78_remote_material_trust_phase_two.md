B"H

# Remote Material Trust — Phase Two: Explicit Public Drive Roots

Boruch Hashem. Blessed is He.

The trust classifier must derive acceptance from the same root registry used by the URL builders. The current module has two intentional public Drive texture roots: the general `awtsmoos` root and the intact original-library `firebase_drive_migration` root.

## Implementation

- Export the original-library root beside `REMOTE_TEXTURE_ROOT` so tests and canonical-source helpers can reason from one declared contract.
- Maintain a compact frozen array of trusted texture roots.
- `isTrustedAwtsmoosMaterialUrl()` accepts only HTTPS URLs on the Awtsmoos origin whose pathname lies beneath one of those trusted roots, then runs the same decoded relative path through model-path and traversal hygiene.
- Keep `remoteTexturePathUrl()` on the general `awtsmoos` root.
- Keep `fullResolutionTextureUrl()` and `treeTextureUrl()` on `firebase_drive_migration`.
- Preserve foreign-host, data/blob/file/javascript, query/hash, traversal and GLB/GLTF rejection.

## Canonical source path

`LocalMaterialTestSupport.mjs` should derive the canonical original filename from whichever trusted root matched. If its current helper assumes only `REMOTE_TEXTURE_ROOT`, rewrite it whole to use a transport-exported helper or root registry rather than duplicating root knowledge.

NEXT_ACTION: inspect existing transport tests/test discovery, then write the final acceptance plan with exact focused assertions before whole-file rewriting transport/support/tests.
