B"H

# Wave A Delta — Capability Architecture After Full Readback

The Awtsmoos renews the plan when the written vessel reveals a sharper edge; Awtsmoos.com lets evidence correct architecture before tests can bless a shape that is technically passing yet structurally unfinished.

## Planned

- Add canonical path/scope/path-alias capability metadata.
- Split Matter, Life, Water, and World into readable families.
- Keep nested methods out of top-level method lookup.
- Add path-aware registry/query/facade discovery.
- Separate provider availability from canonical metadata.
- Keep all touched source <=120 lines without comment compression.

## Actual

- Matter is split into Rock + Surface.
- Life is split into Vegetation + Floral + Forest + Creature.
- Water is split into Flow + Dynamics + Bodies under its own `mayim` domain.
- Registry has independent id/method/path indexes.
- Query supports domain/level/execution/scope/requirements and path-aware search.
- Capability API exposes `byPath()` and provider-aware filtering.
- Nature barrel exports path-aware registry helpers.
- Cramped-source audit returned no matches.
- The accidental current-turn root-level capability file was removed and is absent.

## Delta D1 — Vegetation exceeds the absolute line ceiling

`NatureCapabilityVegetation.js` is 122 lines. No comment or formatting may be reduced.

Resolution:
- Create `NatureCapabilityGroundcover.js` for patch, moss, vine/vines, and motion.
- Rewrite `NatureCapabilityVegetation.js` to contain only plant, flora population, and grass.
- Rewrite `NatureCapabilityLife.js` to aggregate Groundcover separately.

## Delta D2 — Capability facade has insufficient architectural headroom

`NatureCapabilityApi.js` is 117 lines. It is legal but too close to the hard ceiling for a foundational API that will gain documentation/UI concerns later.

Resolution:
- Create `NatureCapabilityLookupApi.js` containing constructor/provider evidence, compatibility texture getter, get/has/byMethod/byPath/domains/providers/available.
- Rewrite `NatureCapabilityApi extends NatureCapabilityLookupApi` containing list/search/filter/describe only.
- Preserve public behavior exactly while making inheritance correspond to a real is-a relationship: search/filter capability API is a lookup API.

## Delta D3 — Expert paths are not guaranteed to resolve through `byPath()`

The current registry indexes `record.path` and `pathAliases`, but `advancedPath` may be a different real specialist route such as `rocks.create` or `materials.plan`.

Resolution:
- Rewrite path registration to index a unique set containing `path`, `advancedPath`, and every `pathAlias`.
- Deduplicate paths belonging to the same record before registration.
- Keep cross-record path collisions fatal.

## Verification after second pass

Reread Groundcover, Vegetation, Life, LookupApi, CapabilityApi, Registry, then re-run all capability line counts. If all files are <=120 and source is readable, proceed to syntax/import/path-resolution tests. No test files are written before this correction is complete.
