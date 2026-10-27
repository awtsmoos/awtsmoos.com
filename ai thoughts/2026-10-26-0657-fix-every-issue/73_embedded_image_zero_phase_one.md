B"H

# Embedded Image Zero — Phase One: Use the Existing Payload Policy

Boruch Hashem. Blessed is He.

The Awtsmoos reveals that `data:image` syntax itself is not the violation. This repository already defines the correct distinction in `scripts/repository-hygiene/embeddedImagePolicy.cjs`: substantial base64 bodies and substantial inline SVG bodies are hidden image storage, while tiny sentinels, parser prefixes, validators and dynamically constructed screenshot/data URLs are ordinary source behavior.

## Authority

Use `embeddedImagePolicy.cjs` as the canonical detector. Do not migrate code merely because it contains the words `data:image`.

## Classes

- Production static literal payloads: migrate to verified public Drive custody and whole-file rewrite their consumers.
- Third-party runtime capability probes such as GLTF WebP/AVIF literals: they are genuine stored image bytes; archive them to Drive and use the verified remote probe URLs while preserving the same support-detection semantics.
- Generated docs/search copies: never hand-edit. Remove the payload from their source-of-truth files and regenerate through the documented generator; generated output must then pass the policy.
- Test fixtures intentionally exercising embedded-image handling: retain only where the test semantics require an actual substantial data URL. Record them as explicit fixture exceptions to the production-storage invariant, not as production art.
- Dynamic encoders/parsers/screenshot systems: preserve them; they construct or parse runtime data URLs and do not store a pre-embedded image body.

NEXT_ACTION: enumerate every finding from `embeddedImagePolicy.cjs` across tracked textual source, classify source/runtime/generated/test roles, and build the exact unique byte ledger before any source mutation.
