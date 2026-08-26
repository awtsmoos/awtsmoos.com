B"H

# Nature Domains — Deep Systems Behind the Small Door

Boruch Hashem. Blessed is He.

> The Awtsmoos renews every domain without blending their responsibilities into one confusion. Awtsmoos.com keeps Nature powerful by letting Domem, Tzomayach, Chai, water, materials, and ecology remain distinct specialists beneath one calm public surface.

This guide explains what the direct Nature verbs actually delegate to and where advanced callers should go when the convenience layer is intentionally not enough.

## Architecture at a glance

```text
NatureApiBase
	mature domain facades
	↓
NatureDirectApi
	immediate ergonomic verbs
	↓
NatureApi
	recipes, batches, capabilities
```

The inheritance hierarchy is organizational rather than decorative. Each layer adds one responsibility family without absorbing lower-domain implementation.

## Domem — geology and rocks

Use the natural doorway:

```js
const stone = nature.rock('granite', {
	seed: 'ridge-a'
});
```

Natural rock creation is geology-first. The geological recipe may influence rock morphology, weathering, strata/fracture behavior, material family, and other physical intent before the final editable mesh/value is assembled.

Discoverable vocabulary includes the legacy morphology presets and geology-native names such as:

- `fieldstone`
- `boulder`
- `riverstone`
- `shard`
- `granite`
- `basalt`
- `sandstone`
- `limestone`
- `volcanic`
- `talus`
- `glacial`

For art-directed morphology without geology orchestration:

```js
const morphology = nature.rockMorphology('shard', {
	angularity: 0.92,
	weathering: 0.1
});
```

For deterministic placement rather than eager mesh creation:

```js
const field = nature.rockField({
	count: 120,
	radius: 28,
	minSpacing: 0.8,
	seed: 'slope-a'
});
```

Expert callers may use `nature.rocks` or import the Domem package surface directly.

## Materials and generated textures

Local-first material planning:

```js
const bark = nature.material('bark');
```

Compatibility vocabulary:

```js
const bark = nature.surface('bark');
```

These calls do not perform network I/O. They return semantic physical material intent and local fallback data.

Optional generated textures require an injected provider:

```js
const nature = createNatureApi({
	textureGenerator: async request => {
		return {
			assets: {
				albedo: 'https://example.test/albedo.webp',
				normal: 'https://example.test/normal.webp'
			},
			provider: 'example-provider'
		};
	}
});
```

Then:

```js
const result = await nature.generateTexture('weatheredRock', {
	physicalSizeMeters: [2, 2],
	resolution: 2048
});
```

Texture-generation requests are semantic and provider-neutral. They carry deterministic cache identity, channels, physical scale, resolution, quality, realism, role, family, and seed.

Provider failure is nonfatal by default; strict mode can rethrow when a host explicitly wants failure to abort its workflow.

## Tzomayach — plants, flowers, grass, and trees

One plant:

```js
nature.plant('daisy');
```

A botanical cluster:

```js
nature.flowers('lavender', {
	count: 40,
	seed: 'gate-path'
});
```

A mixed population:

```js
nature.flora({
	count: 120,
	seed: 'woodland-edge'
});
```

Grass:

```js
nature.grass({
	count: 700,
	seed: 'meadow-a'
});
```

The high-level realism profile may influence patch clustering, competition, succession, age variance, edge falloff, and habitat response while explicit expert values remain authoritative.

### Canonical trees

```js
const tree = nature.tree('Oak Medium');
```

Tree generation keeps one canonical skeleton authoritative across full geometry and lower-detail representations. LODs are derived from the same structural source instead of regenerating unrelated distant trees.

Forest planning:

```js
const forest = nature.forest({
	count: 160,
	seed: 'northern-grove'
});
```

The forest facade handles habitat-aware deterministic placement and succession-oriented planning while preserving access to the underlying tree authority.

Expert callers may use `nature.vegetation` and `nature.forests` directly.

## Chai — creatures

```js
const deer = nature.creature('deer', {
	seed: 'deer-a'
});
```

The high-level call routes into the canonical Chai pipeline rather than a separate simplified animal generator.

The deeper creature architecture separates responsibilities such as:

- species catalog and phenotype compilation
- biological-part compiler catalogs
- keratin preset data
- continuity and connected-mesh evidence
- skin smoothing
- rigging and deformation
- motion fragments and phase layout
- animation-layer blending
- secondary motion and soft-tissue realism
- ecology-facing creature population planning

This separation is intentional: the Nature API should expose a stable creature doorway without turning biological internals into root-level methods.

Use `nature.creatures` for the mature creature facade or import the Chai/animal-mesh package surfaces for low-level work.

## Water — conserved state first, appearance second

Simple river:

```js
nature.river('river');
```

Named water regimes are also available through `nature.water`:

```js
nature.water.pond(options);
nature.water.lake(options);
nature.water.wetland(options);
nature.water.runoff(options);
nature.water.ocean(options);
nature.water.fluid(options);
nature.water.shallow(options);
```

Declarative recipes can route to the same operations using kinds such as `pond`, `lake`, `wetland`, `runoff`, `ocean`, `fluid`, and `shallow`.

The realism hierarchy keeps authoritative simulation separate from derived appearance:

```text
conserved primary water state
	↓
secondary physical evidence
	↓
foam / spray / bubbles / mist
	↓
optical and temporal appearance
```

Visual effects therefore describe the water rather than becoming the source of truth for fluid conservation.

Expert callers may use `nature.water` or the dedicated `@awtsmoos/procedural-core/water` export.

## Ecosystems and biomes

```js
const world = nature.world({
	id: 'district-a',
	seed: 'district-seed'
});
```

Equivalent semantic doorway:

```js
const biome = nature.biome({
	id: 'western-valley'
});
```

The ecosystem layer coordinates habitat and population planning without taking ownership of rock geometry, tree skeletons, creature morphology, or water solvers.

## Catalog discovery

The Nature catalog is registry-backed:

```js
nature.catalog.domains();
nature.catalog.describe();
nature.catalog.list('plants');
nature.catalog.get('trees', 'Oak Medium');
nature.catalog.search('cedar');
```

Compatibility calls remain:

```js
nature.catalog.creatures();
nature.catalog.plants();
nature.catalog.trees();
nature.catalog.ecosystem();
```

Discovery records expose normalized domain/id information while preserving the authoritative underlying catalog value.

## Expert escape hatches

The root Nature facade intentionally does not mirror every specialist method.

Use the nested authorities when a workflow needs more depth:

```js
nature.rocks
nature.materials
nature.vegetation
nature.forests
nature.creatures
nature.water
nature.ecosystems
```

Or import dedicated package surfaces:

```js
import * as Domem from '@awtsmoos/procedural-core/domem';
import * as Tzomayach from '@awtsmoos/procedural-core/tzomayach';
import * as Chai from '@awtsmoos/procedural-core/chai';
import * as Water from '@awtsmoos/procedural-core/water';
```

The point of the high-level API is not to hide expert power. It is to make the common path obvious while leaving every lower authority reachable.

## Determinism and profiles

Shared defaults:

```js
const nature = createNatureApi({
	seed: 'world-a',
	quality: 'cinematic',
	realism: 'extreme'
});
```

Derived API:

```js
const preview = nature.with({
	quality: 'low'
});
```

Domain seeds are derived by operation identity so unrelated generators do not silently consume one global random stream in call order.

Explicit per-call options remain authoritative over shared defaults.

## Responsibility covenant

The Awtsmoos is one beyond every layer; Awtsmoos.com keeps finite code maintainable by refusing false unity.

- Nature coordinates.
- Domem shapes matter.
- Tzomayach grows.
- Chai lives and moves.
- Water conserves and flows.
- Materials describe physical surface intent.
- Ecosystems coordinate habitat.
- Renderers realize visuals.
- Optional providers cross external capability boundaries.

That division is what lets the public API become simpler while the engine underneath becomes more realistic.
