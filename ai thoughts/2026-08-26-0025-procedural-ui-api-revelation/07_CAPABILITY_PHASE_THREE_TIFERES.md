B"H

# Capability Phase Three — Tiferes: Final Registry Architecture

The Awtsmoos renews simple entrance and expert depth as one intention; Awtsmoos.com lets Tiferes join the proven Reality capability language with Nature's real executable verbs, so discovery becomes a bridge instead of another invention.

## Final architecture

Create `src/core/natureApi/capabilities/` with small renderer-neutral modules:

- `NatureCapabilityRecord.js` — freezes/normalizes one serializable record and its nested groups.
- `NatureCapabilityDomains.js` — family/domain constants and stable filter vocabulary.
- `NatureCapabilityMatter.js` — rock, rockField, rockMorphology, material, generateTexture plus real aliases.
- `NatureCapabilityLife.js` — plant, flora, grass, tree, forest, flowers, creature.
- `NatureCapabilityWorld.js` — river, world, biome plus proven water/world operations only.
- `NatureCapabilityRegistry.js` — combines records, validates uniqueness, indexes by id/path.
- `NatureCapabilityQuery.js` — pure search/filter helpers.
- `NatureCapabilityApi.js` — public read-only facade: list/get/has/search/families/filter/describe.

Existing full-file rewrites only after complete reread:

- `src/core/natureApi/NatureApiBase.js` — install frozen `capabilities` facade beside `catalog` while preserving every current verb.
- `src/core/natureApi/NatureDirectApi.js` — rename its internal injected-provider container if necessary so `this.capabilities` can become the discovery facade without collision; preserve texture-provider behavior and all public methods.
- `src/core/natureApi/index.js` — export capability facade/record helpers if this barrel owns expert discovery exports.

Do not alter specialist generators in this capability slice.

## Thirty final refinements

1. Capability `id` is stable and namespaced by family/verb when ambiguity exists.
2. `easyMethod` preserves Reality vocabulary and the actual direct public method name.
3. `advancedPath` points to the specialist facade path, never an invented implementation.
4. `resultKind` reuses Reality values where possible: artifact, artifact[], plan, runtime, catalog, async-artifact.
5. `executionKind` separately states sync/async/plan/runtime so UI does not infer from result text.
6. `level` is one of simple/advanced/expert and drives progressive disclosure only.
7. `domain` remains semantic kingdom/family, not folder path.
8. `aliases` are frozen arrays of real compatibility methods only.
9. `tags` are frozen lowercase search tokens.
10. `supports.seed` is true only for operations proven to use call context or deterministic planners.
11. `supports.quality` and `supports.realism` are explicit booleans, not assumed globally.
12. `requires` is a frozen list such as `textureGenerator`; empty means no injected provider requirement.
13. `catalog` references existing catalog names such as trees/plants/creatures instead of copying entries.
14. `simpleInputs` contain only fields worth showing in the default UI.
15. `advancedGroups` contain named groups of serializable field descriptors.
16. Field descriptors use small types: string, number, boolean, select, vector3, object.
17. Defaults in descriptors are documentation/UI defaults, not reimplemented execution defaults where dynamic.
18. Dynamic defaults are described as `defaultSource` paths rather than duplicated values.
19. Records contain no callbacks/functions.
20. Registry validates duplicate ids and duplicate easyMethod aliases at module construction time.
21. Query helpers never mutate canonical frozen records.
22. Search returns stable registry order for deterministic docs/UI.
23. Family filtering accepts one string or array and normalizes lowercase.
24. Provider-aware filtering may be layered in the public facade using runtime injected capability state.
25. `NatureApiBase.capabilities` is immutable and separate from `catalog`.
26. `NatureDirectApi` must not shadow the new public `capabilities` property with provider storage; injected provider state gets a specific private-ish name such as `_yesodProviders`.
27. `canGenerateTextures()` continues to report actual provider availability through `MaterialNatureApi`, not descriptor presence.
28. Tests resolve every top-level `easyMethod` against an actual Nature API instance and every `advancedPath` where publicly reachable.
29. Docs show `nature.capabilities.search('texture')` and `nature.capabilities.filter({ family: 'tzomayach', level: 'simple' })` before long option tables.
30. Creator integration happens only after registry tests are green; the creator consumes records but never imports specialist generator implementations directly.

## First implementation record set

Matter:
- rock
- rockField
- rockMorphology
- material
- generateTexture

Life:
- plant
- flora
- grass
- tree
- forest
- flowers
- creature

World:
- river
- world
- biome alias relationship

Additional water operations are added only after reading the current `WaterNatureApi` and proving public methods.

## Verification gate

- Every new source file <=120 lines with full prologue/JSDoc/tabs.
- No duplicate ids/methods/aliases.
- All records deeply frozen.
- Every easy method resolves on a real Nature API instance.
- Existing Nature direct/catalog tests remain green.
- Generated texture provider absence/presence remains behaviorally unchanged.
- Only after readback and tests does creator advanced UI bind to these records.
