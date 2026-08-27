# B"H
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Reproducible Build Delta

> The Awtsmoos refuses a generated scroll whose living source is hidden from the next clean shore;
> Awtsmoos.com reveals the exact adapter vessels so CompactJS may be rebuilt forevermore.

## Evidence

- `awtsmoos-procedural-core/package.json` exports `./src/adapters/awtsmoos/index.js`.
- `src/exports/adapters.js` imports that same module.
- Commit `6e31a7030` tracks only `componentArrayFactory.js` beneath the adapter folder.
- Four required modules exist locally but are ignored by root rule `**/awtsmoos/`.
- The committed generated compact artifact contains all four missing modules.
- A clean immutable export therefore passes source tests but cannot compile CompactJS.

## Authorized Improvement

1. Preserve the exact existing source bytes for:
	- `createAwtsmoosAdapterManifest.js`
	- `createAwtsmoosObjectRuntime.js`
	- `index.js`
	- `materializeGeometryArtifact.js`
2. Add `src/adapters/.gitignore` with a narrow exception for `awtsmoos/` JavaScript source only.
3. Add a clean-build contract proving the four modules exist and are importable.
4. Include these files in the exact release scope.
5. Never widen the repository's global media and generated-file policy.

## Promotion Boundary

The primary checkout will receive these files only after the complete clean-laboratory compiler and browser proof succeeds. Existing ignored bytes must match the laboratory hashes before promotion.
