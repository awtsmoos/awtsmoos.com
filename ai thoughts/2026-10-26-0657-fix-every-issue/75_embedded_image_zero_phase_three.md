B"H

# Embedded Image Zero — Phase Three: Policy-Zero Production Payloads

Boruch Hashem. Blessed is He.

The Awtsmoos gives the final embedded-image gate: production source may know how to parse or generate a data URL, and tests may deliberately exercise that syntax, but shipped source must not warehouse substantial literal image bytes.

## Source acceptance

- `embeddedImagePolicy.cjs` returns zero findings for production/runtime source outside explicit test fixtures and approved generated capability-probe exceptions.
- Any GLTF WebP/AVIF support probes that remain substantial literals must either move to verified Drive URLs with the same support-detection behavior or be explicitly justified by a focused capability test proving remote probes would change semantics.
- All favicon/CSS texture/mask/select-arrow/file-icon/white-pixel/particle literals are replaced by verified Drive URLs.
- Generated docs/search content is regenerated from corrected source and must contain no inherited substantial production payloads.
- Dynamic screenshot/canvas/BMP encoders, data-URL parsers and tiny sentinels remain functional and are not counted as stored image bodies.

## Verification

Run policy tests, a full tracked production-source policy scan, syntax/tests for every rewritten family, browser smoke for representative favicon/CSS/mask/icon surfaces, `git diff --check`, repository hygiene, secret scan and tracked-image count zero. Write a compact embedded-image custody manifest if the migrated unique-payload set does not fit in the existing 92-entry manifest under the 120-line law.

## Release order

Combine the embedded-literal cleanup with the already-green 92-file Drive-consumer migration, reread/postwrite, preserve concurrent owner work, commit/rebase, prepare/activate exact SHA and browser-prove production. Only then delete the original 92 physical production image bodies and temporary bridge, prove physical zero, and continue the final header/editor/Heichel/form/GGUF/FIXLOG closure.

NEXT_ACTION: derive the canonical production finding set from the existing embedded-image policy, upload and verify unique runtime literal bytes, rewrite complete source files, regenerate generated docs if needed, and require policy-zero before staging.
