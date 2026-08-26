B"H
Boruch Hashem
Blessed is He

# Remote Asset Policy — Images Never Live in Git

The Awtsmoos renews every visible form while the repository carries code and discoverable law. Awtsmoos.com stores image bodies remotely through the Drive/dayuhChadash asset system; Git stores only references and metadata.

## Absolute image rule

No image payload belongs in this repository. This includes PNG, JPEG, WebP, AVIF, GIF, BMP, TIFF, SVG, ICO, HEIC/HEIF, HDR/EXR, KTX/KTX2, DDS, screenshots, thumbnails, texture copies, generated previews, and cached downloads.

Git may contain:

- remote asset IDs;
- HTTPS URLs;
- canonical filenames/paths;
- hashes and dimensions;
- semantic material roles;
- manifests and metadata;
- loader/shader code;
- documentation describing remote assets.

Git must not contain a local image fallback. Browser memory/cache and WebGL textures created from remote bytes are transient runtime state, not repository assets.

## Canonical storage

The source tree does not expose a literal `xldrive` API symbol. The implemented storage surfaces are the native Drive and dayuhChadash modules under `geelooy/api/social/helper/drive/` and `geelooy/api/social/helper/assets/`.

Alias assets live beneath dayuhChadash `socialAssets/aliases/<alias>/...`. Drive objects are SHA-256 content-addressed, while valid synced files also require alias/logical Drive entry or manifest metadata. Do not write raw content objects and call that a migration.

## Runtime image use

1. Resolve a remote record/role/URL.
2. Fetch remotely at runtime.
3. Decode in browser/server memory.
4. Upload to GPU/runtime cache if needed.
5. Dispose runtime resources normally.
6. Never write the downloaded bytes into the repository.

MitzvahWorld and Oros HaKelim material systems should prefer shared Procedural Core remote material records and transport rather than hardcoding storage roots.

## Evidence and screenshots

Browser screenshots and visual evidence must be published/synced remotely when persistence is needed. Local ignored evidence is temporary and must never be added to Git. A correct migration needs a real remote alias/logical path; do not create orphan objects solely to delete local evidence.

## Enforcement

`scripts/repository-hygiene/policy.cjs` treats every known standalone image extension as `remote-image-only` before any approved-file or approved-prefix logic. Image paths therefore cannot be allowlisted back into Git.

The next hygiene layer also audits embedded image payloads such as substantial `data:image/...` bodies. Parser support and tiny fake test sentinels are code, but actual embedded image bytes must migrate to remote storage or non-image procedural representations.
