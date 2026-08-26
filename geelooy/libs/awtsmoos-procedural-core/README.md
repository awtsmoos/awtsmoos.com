# B"H — Awtsmoos Procedural Core

Boruch Hashem. Blessed is He.

> The Awtsmoos renews stone, tree, creature, river, texture, recipe, and world from one source of being. Awtsmoos.com keeps the first doorway simple while deeper specialist vessels remain available for precise seeing.

A renderer-neutral procedural world library for deterministic natural matter, geometry, materials, creatures, ecosystems, water, simulation, and host adapters.

Application code should normally begin with the high-level Nature API, then descend into specialist exports only when it needs expert control.

## Nature — recommended doorway

```js
import {
	createNatureApi
} from '@awtsmoos/procedural-core/nature';

const nature = createNatureApi({
	seed: 'gan-eden',
	quality: 'high',
	realism: 'extreme'
});
```

The common path stays small:

```js
const rock = nature.rock('granite');
const meadow = nature.grass({ count: 600 });
const flowers = nature.flowers('lavender', { count: 36 });
const oak = nature.tree('Oak Medium');
const deer = nature.creature('deer');
const river = nature.river('river');
const world = nature.biome({ id: 'western-valley' });
```

Every common operation is seedable and deterministic. Core results are renderer-neutral data/runtime vessels; adapters decide how they become WebGL, Three.js, native, or other host objects.

## Geology-first natural stone

`nature.rock()` uses geological authority by default so rock family, erosion, fracture, strata, geometry, and material intent can arise from one physical recipe.

```js
const riverStone = nature.rock('riverstone', {
	radius: 1.4,
	seed: 'river-bank-7'
});
```

The catalog preserves legacy morphology names while also exposing geology-native intent such as `granite`, `basalt`, `sandstone`, `limestone`, `volcanic`, `talus`, and `glacial`.

For explicit art direction through morphology rather than geology:

```js
const stylizedShard = nature.rockMorphology('shard', {
	angularity: 0.95
});
```

## Materials and optional generated textures

Local semantic material planning never requires network access:

```js
const bark = nature.material('bark');
```

Compatibility alias:

```js
const bark = nature.surface('bark');
```

A host may inject any compatible generated-texture provider:

```js
const nature = createNatureApi({
	seed: 613,
	textureGenerator: async request => ({
		provider: 'my-texture-service',
		assets: await generateRemoteTextureAssets(request)
	})
});

const generated = await nature.generateTexture('bark', {
	resolution: 2048,
	channels: ['albedo', 'normal', 'roughness']
});
```

Generation is local-first. Failure, cancellation, and unavailable providers are explicit; geometry never depends on hidden remote success.

## Declarative recipes

Direct calls remain the easiest choice for normal code. When the request itself should be data, use the same engines through recipes:

```js
const result = nature.create({
	id: 'ridge-stone',
	kind: 'rock',
	preset: 'basalt',
	seed: 'ridge-a'
});
```

Ordered batches are also available:

```js
const batch = nature.batch([
	{ kind: 'rock-field', options: { count: 80 } },
	{ kind: 'grass', options: { count: 600 } },
	{ kind: 'tree', value: 'Oak Medium' }
]);
```

Async capability work is explicit:

```js
const texture = await nature.createAsync({
	kind: 'texture',
	role: 'weatheredRock'
});
```

Recipes can be serialized through the dedicated codec when they contain persistence-safe data. Runtime-only functions, cyclic graphs, custom prototypes, and non-finite numbers are rejected instead of silently corrupted.

## Discover capabilities instead of probing by failure

```js
nature.supports('rock');
nature.supports('surface-generation');

const capabilities = nature.describe();
```

`describe()` exposes immutable operation metadata, descriptions, sync/async mode, shared defaults, and optional generated-texture availability.

Catalog discovery is registry-backed:

```js
nature.catalog.domains();
nature.catalog.list('plants');
nature.catalog.search('cedar');
```

The older convenience catalog methods remain available.

## Specialist domains

For deeper work, the same facade exposes focused authorities:

- `nature.rocks` — geological rocks, fields, and explicit morphology
- `nature.materials` / `nature.surfaces` — local material intent and generated textures
- `nature.vegetation` — plants, grass, botanical populations, flower clusters
- `nature.forests` — canonical trees and forest composition
- `nature.creatures` — Chai creature creation and population-facing contracts
- `nature.ecosystems` — coupled habitat planning
- `nature.water` — rivers and natural water regimes
- `nature.catalog` — generic cross-domain discovery

Use specialist façades when the simple verb is not expressive enough; do not reach into random private files merely to bypass an existing authority.

## Documentation path

Start small, then expand only as needed:

- [`docs/NATURE_API.md`](./docs/NATURE_API.md) — direct API and discovery quick start
- [`docs/NATURE_RECIPES.md`](./docs/NATURE_RECIPES.md) — recipes, batches, codecs, registries, capabilities
- [`docs/NATURE_DOMAINS.md`](./docs/NATURE_DOMAINS.md) — geology, vegetation, forests, creatures, water, materials, expert escape hatches
- [`docs/TEXTURE_REGISTRY.md`](./docs/TEXTURE_REGISTRY.md) — trusted remote material registry and hydration boundary

## Low-level package surfaces

Dedicated exports preserve clean expert boundaries:

```js
import * as Domem from '@awtsmoos/procedural-core/domem';
import * as Tzomayach from '@awtsmoos/procedural-core/tzomayach';
import * as Chai from '@awtsmoos/procedural-core/chai';
import * as Water from '@awtsmoos/procedural-core/water';
```

The broader procedural-object, animal-mesh, WebGPU, Blender, architecture, asset, and adapter surfaces remain available through their own package exports.

## Low-level procedural geometry

The original renderer-neutral geometry pipeline remains available from the root package:

```js
import {
	generateProceduralGeometry
} from '@awtsmoos/procedural-core';

const renderData = generateProceduralGeometry(
	'cube',
	{ size: 2, color: [0.2, 0.7, 1, 1] },
	[
		{ type: 'subdivide', levels: 2 },
		{ type: 'extrudeFaces', params: { distance: 1.2, scale: 0.5 } }
	],
	{ id: 'query-tower' }
);
```

## Host adapters

Adapters turn renderer-neutral core truth into host/runtime objects. The core does not require Three.js, WebGL, browser DOM state, remote fetch, or persistent storage in order to generate procedural intent.

Keep adapter-specific objects at adapter boundaries; do not move them into Domem, Tzomayach, Chai, water, or Nature core contracts.

## Test lanes

```bash
npm run test:nature-api
npm run test:animal-mesh
npm run test:procedural-object
npm run test:extreme-realism
npm test
```

New public behavior should receive contract tests for determinism, failure semantics, compatibility, bounded resources, and discoverability—not merely an existence assertion.

## Architecture covenant

- `src/core` owns deterministic renderer-neutral procedural truth.
- `src/core/natureApi` owns high-level natural-world coordination and orchestration.
- `NatureApiBase` owns mature specialist domain façades.
- `NatureDirectApi` owns immediate ergonomic verbs.
- `NatureApi` owns recipes, ordered batches, and capability discovery.
- `src/adapters` converts core data into host/runtime objects.
- Remote providers are explicit injected capabilities, never hidden dependencies of geometry creation.
- Public entry points preserve stable contracts while deeper modules may evolve behind them.

The Awtsmoos is one beyond every layer; Awtsmoos.com keeps the library expandable by letting each finite vessel remain clear, focused, testable, and replaceable.
