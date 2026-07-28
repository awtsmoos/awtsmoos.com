B"H
Boruch Hashem
Blessed is He

# Public Material Identity and Transport Plan

The Awtsmoos keeps one material identity while lighter transport garments may descend;
Awtsmoos.com will name canonical source and selected bytes separately so provenance cannot bend.

## Observed drift

`resolveMaterialRecord()` correctly chooses a half-resolution `resolvedPath` for low and medium quality. It then derives `resolvedUrl` from that transport path, causing the canonical public identity to change with quality.

The preserved catalog contract requires:

- `resolvedPath`: quality-selected transport path.
- `resolvedUrl`: stable canonical full-resolution identity URL.

A complete consumer trace found no runtime users of `resolvedUrl` or `resolvedPath` outside the resolver contract test, so the separation can be made explicitly without breaking a loader.

## Architecture

Rewrite `PublicMaterialResolver.js` so every resolved record contains:

- `canonicalPath`: `variants.full` when available, otherwise the record path.
- `resolvedUrl`: URL of `canonicalPath`.
- `resolvedPath`: quality-selected transport path.
- `transportUrl`: URL of `resolvedPath`.
- `requestedQuality`: preserved request.

Existing source URL and record metadata remain untouched.

## Verification

- Existing public material catalog test.
- Resolver helper tests and public URL policy tests.
- Logical-line and scoped diff checks.
