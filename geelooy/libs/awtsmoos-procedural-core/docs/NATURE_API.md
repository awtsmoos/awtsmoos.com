B"H

# Nature API — Simple Door, Deep Garden

Boruch Hashem. Blessed is He.

> The Awtsmoos renews stone, grass, flower, tree, creature, river, and surface every instant. Awtsmoos.com keeps the public door small while specialist authorities remain available behind it.

## Purpose

`NatureApi` is the renderer-neutral convenience layer for procedural nature. It does not replace Domem, Tzomayach, Chai, ecosystem, material, or water authorities. It coordinates them with one shared seed/profile contract and returns immutable result envelopes.

```js
import { createNatureApi } from '../src/core/natureApi/index.js';

const nature = createNatureApi({
	seed: 'mitzvah-world',
	quality: 'medium',
	realism: 'extreme'
});
```

Every result contains `kind`, `seed`, `quality`, `realism`, `value`, and `diagnostics`.

## One-line doors

```js
const grass = nature.grass({ count: 320 });
const flowers = nature.flowers('daisy', { count: 28 });
const tree = nature.tree('Oak Medium');
const cow = nature.creature('cow');
const river = nature.river('river');
const world = nature.world({ id: 'district-a' });
```

Existing mature calls remain unchanged: `plant()`, `tree()`, `creature()`, `river()`, and `world()` still delegate to their canonical specialist engines.

## Vegetation ecology — simple first

Grass and mixed vegetation automatically translate the shared realism profile into neutral ecology controls. Lower ecosystem and grass engines never depend on names such as `realistic` or `extreme`; they receive ordinary patch, habitat, spacing, and preference data.

```js
const meadow = nature.grass({
	count: 560,
	seed: 'orchard-meadow'
});

const woodlandEdge = nature.vegetation.population({
	count: 120,
	seed: 'woodland-edge'
});
```

The shared profile can influence patchiness, clustering, competition, succession, age variance, moisture response, and edge falloff while remaining deterministic for the same seed and options.

### Advanced ecology without a larger public API

Use `ecology` when a scene needs stronger artistic or environmental direction:

```js
const wetMeadow = nature.grass({
	count: 700,
	ecology: {
		clustering: 0.78,
		edgeFalloff: 0.72,
		moistureResponse: 0.9
	}
});
```

Mixed populations accept the same high-level ecology object. Expert neutral knobs such as `patchClustering`, `patchCompetition`, `patchSuccession`, `patchAgeVariance`, and `patchEdgeFalloff` remain available for precise pipelines.

Explicit expert options always win over profile defaults. Existing `patchiness`, `patchCount`, `patchRadius`, and explicit grass `preferences.moisture` remain sovereign.

## Flowers

`flowers(species, options)` is intentionally a convenience over the canonical botanical cluster engine, not a second flower implementation.

```js
nature.flowers('lavender', { count: 36, seed: 'gate-path' });
nature.flowers('forget-me-not', { count: 52, seed: 'water-edge' });
```

The shared botanical catalog includes daisies, roses, lavender, foxglove, allium, tulips, violets, water-edge flowers, woodland flowers, and many other real identities.

## Rocks

Create one editable Domem stone:

```js
const stone = nature.rock('riverstone', {
	radius: 1.4,
	seed: 'river-bank-7',
	surfaceRole: 'weatheredRock'
});
```

Available morphology presets are `fieldstone`, `boulder`, `riverstone`, and `shard`. Advanced recipes may override `stretch`, `flattening`, `weathering`, `strata`, `angularity`, `subdivisions`, and `surfaceRole`.

Plan a field without eagerly allocating every mesh:

```js
const field = nature.rockField({
	count: 80,
	radius: 24,
	minSpacing: 0.9,
	cluster: 0.62,
	seed: 'western-slope',
	rock: 'fieldstone'
});
```

The field planner is finite and bounded. It returns deterministic placements with child seeds, positions, scale, yaw, requested count, placed count, and saturation evidence.

## Semantic surfaces

```js
const bark = nature.surface('bark');
const stoneSurface = nature.surface('weatheredRock');
const glass = nature.surface('glass');
```

A surface plan never fetches. It contains a local PBR fallback plus optional remote hydration metadata. Remote failure policy is always `keep-local`; geometry creation never depends on network success.

Renderer or game adapters may later hydrate `surface.value.remote.url`, cache by `surface.value.remote.cacheKey`, or ignore remote data entirely.

## Advanced domain access

The simple door never hides expert control:

```js
nature.vegetation.plantCluster('daisy', options);
nature.forests.tree('Oak Medium', options);
nature.creatures.create('deer', options);
nature.rocks.field(options);
nature.surfaces.create('grass', options);
```

Low-level experts may also import `@awtsmoos/procedural-core/domem` for editable-matter tools directly.

## Profiles and deterministic cloning

```js
const cinematic = nature.with({ quality: 'cinematic' });
const stylized = nature.with({ realism: 'stylized', seed: 'alternate-world' });
```

`with()` returns a separate immutable API. Domain seeds are derived from shared defaults plus call identity so unrelated generators do not silently consume one global random stream.

## Architecture covenant

- Domem owns editable matter and rock geometry.
- Tzomayach owns grass, botanical organisms, clusters, and trees.
- Chai owns creatures.
- Ecosystem specialists own neutral habitat, patch, spacing, maturity, and population equations.
- Material registries own semantic texture/material records.
- Nature API coordinates convenience, profiles, seeds, results, diagnostics, and profile-to-neutral-option translation.
- Renderers own material realization and texture hydration.
- Network transport never hides inside a geometry constructor.

This separation keeps the surface simple while allowing each underlying kingdom to expand independently without API collision.
