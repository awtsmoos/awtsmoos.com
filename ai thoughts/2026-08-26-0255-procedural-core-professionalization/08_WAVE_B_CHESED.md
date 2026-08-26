B"H

# Wave B — Chesed: Material Lineage and Professional Surface Identity

The Awtsmoos renews local color, distant image, generated possibility, and layered recipe before any renderer chooses a garment; Awtsmoos.com can therefore reveal one professional material lineage where every source remains distinct, every fallback remains true, and every identity remains inspectable without hidden I/O coming through.

## Evidence from current source

- Local surface plans already expose a deterministic `fallbackKey` shared by remote and generated intent.
- Known remote textures already expose HTTPS-only policy, legacy `requestKey`, richer `variantKey`, content version, integrity, transform, channel, color space, and serializable provenance.
- Generated textures already expose canonical channels, deterministic request `cacheKey`, provider identity, coverage manifest, abort/failure status, and shallow JSON-safe provider metadata.
- Surface planning is local-first and synchronous; generation is explicit and asynchronous.
- Material composition already owns channel, blend, layer, stack, and concise mix authoring.
- Material stack recipes preserve logical richness separately from renderer capacity.
- Remote image caching already has explicit ownership, in-flight deduplication, caller-local cancellation, cache diagnostics, and no leaked mutable Maps.

## Ideal professional API

Preserve every current method and add inspection-only doors under `nature.materials`:

- `lineage(role, options)` — immutable local/remote/generated lineage without I/O.
- `identity(role, options)` — stable aggregate material identity derived from existing source identities.
- `generationRequest(role, options)` — deterministic provider-neutral request without invoking provider work.
- `generationKey(role, options)` — transparent stable generation cache identity.
- `generationProvider()` — frozen provider availability/name evidence without exposing mutable provider internals.
- `describeMaterial(role, options)` — concise surface plan + lineage + availability description for docs/UI/agents.

Optional composition identity:

- `recipeIdentity(recipe)` — stable deterministic identity for material stack/mix recipes based on canonical serializable authoring data.

## Non-goals

- No new HTTP client.
- No new image cache.
- No new material renderer.
- No second PBR stack language.
- No automatic remote or generated work from inspection calls.
- No copying provider secrets or provider implementation objects into public lineage records.
- No opaque hash requirement; transparent stable identities remain preferable for diagnostics.

## Source candidates

New small modules:

- `src/core/natureApi/MaterialNatureLineage.js`
- `src/core/natureApi/MaterialNatureIdentity.js`
- `src/core/natureApi/MaterialNatureInspectionApi.js`
- possibly `src/core/materials/stack/MaterialStackIdentity.js` if stack identity belongs below Nature API.

Whole-file rewrites after final critique:

- `MaterialNatureApi.js` to extend the inspection facade while preserving generation aliases.
- `NatureCapabilitySurface.js` to describe the new nested inspection paths.
- `natureApi/index.js` only if expert helpers require export.

## Success evidence required

- Inspection calls never invoke providers.
- Equivalent options create equivalent identities.
- Local fallback identity is preserved verbatim.
- Remote variant identity is preserved verbatim when available.
- Generated request cache identity is preserved verbatim.
- Provider report names normalized providers without exposing the provider object.
- Existing material/generation tests remain green.
- New source remains <=120 lines and fully readable.
