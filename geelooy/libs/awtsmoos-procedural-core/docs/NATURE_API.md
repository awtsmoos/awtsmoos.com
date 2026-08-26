B"H

# Nature API — One Door Into a Living World

Boruch Hashem. Blessed is He.

> The Awtsmoos renews stone, leaf, creature, river, texture, and habitat every instant. Awtsmoos.com keeps the public doorway calm while deep specialist authorities remain available behind it.

`NatureApi` is the recommended renderer-neutral entrance for procedural nature. It does not replace Domem, Tzomayach, Chai, water, material, or ecosystem engines. It composes them through shared deterministic defaults and stable result contracts.

## Install-time import surface

```js
import {
	createNatureApi
} from '@awtsmoos/procedural-core/nature';
```

Internal source imports still work inside the repository, but package consumers should prefer the dedicated `./nature` export.

## Create one immutable API

```js
const nature = createNatureApi({
	seed: 'mitzvah-world',
	quality: 'high',
	realism: 'extreme'
});
```

Most direct calls return the normal Nature result envelope with shared profile evidence such as `kind`, `seed`, `quality`, `realism`, `value`, and `diagnostics`.

## The small direct surface

```js
const rock = nature.rock('granite');
const field = nature.rockField({ count: 80 });
const bark = nature.material('bark');
const flowers = nature.flowers('lavender', { count: 36 });
const plant = nature.plant('daisy');
const meadow = nature.grass({ count: 560 });
const tree = nature.tree('Oak Medium');
const forest = nature.forest({ count: 120 });
const deer = nature.creature('deer');
const river = nature.river('river');
const world = nature.biome({ id: 'western-valley' });
```

Aliases retained for compatibility:

- `surface(role, options)` → semantic material planning.
- `generateSurface(role, options)` → generated-texture capability.
- `world(options)` and `biome(options)` both enter the coupled ecosystem planner.

## Natural rocks versus morphology

`rock()` is geology-first. Use geological intent for believable natural stone:

```js
const cliffStone = nature.rock('basalt', {
	seed: 'western-cliff',
	radius: 1.8
});
```

Current discoverable rock vocabulary includes the legacy morphology names plus geology-native presets such as `granite`, `basalt`, `sandstone`, `limestone`, `volcanic`, `talus`, and `glacial`.

For direct art-direction of shape without geology orchestration:

```js
const shaped = nature.rockMorphology('shard', {
	angularity: 0.9,
	stretch: [1, 2.2, 0.7]
});
```

## Local-first materials

```js
const stone = nature.material('weatheredRock');
const leaf = nature.surface('leaf');
```

Material planning does not fetch. It keeps a local physical fallback authoritative while exposing optional remote material metadata when available.

Generated texture work is explicitly asynchronous and capability-injected:

```js
const generated = await nature.generateTexture('weatheredRock', {
	channels: ['albedo', 'normal', 'roughness'],
	physicalSizeMeters: [3, 3],
	resolution: 4096
});
```

No generator installed? The API remains usable and the local material path remains valid.

## Discover before calling

```js
nature.supports('rock');
nature.supports('surface-generation');

const report = nature.describe();
```

`describe()` returns immutable operation metadata including operation kind, sync/async mode, input style, description, shared defaults, and whether generated-texture capability is currently installed.

Catalog discovery is also generic:

```js
nature.catalog.domains();
nature.catalog.list('plants');
nature.catalog.search('cedar');
```

Existing convenience calls remain:

```js
nature.catalog.creatures();
nature.catalog.plants();
nature.catalog.trees();
nature.catalog.ecosystem();
```

## Clone profiles without shared mutable state

```js
const cinematic = nature.with({
	quality: 'cinematic'
});

const alternate = nature.with({
	seed: 'alternate-world'
});
```

`with()` returns a separate immutable API while preserving optional provider and operation-registry capabilities unless explicitly replaced.

## Progressive disclosure

Use this page for direct creation and discovery.

For declarative saved-world workflows, batches, codecs, custom registries, and async orchestration, read [`NATURE_RECIPES.md`](./NATURE_RECIPES.md).

For geology, vegetation, forests, grass, creatures, water realism, materials, and expert domain façades, read [`NATURE_DOMAINS.md`](./NATURE_DOMAINS.md).

## Architecture covenant

- Domem owns editable matter and geological rock construction.
- Tzomayach owns plants, flower clusters, grass, and canonical trees.
- Chai owns creature morphology, biology, rigging, motion, and ecology-facing creature contracts.
- Water authorities own conserved fluid state and natural water regimes.
- Ecosystem authorities own coupled habitat and population planning.
- Material authorities own semantic physical material intent and optional generated-texture capability boundaries.
- `NatureApiBase` owns mature domain façades.
- `NatureDirectApi` owns immediate ergonomic verbs.
- `NatureApi` owns declarative orchestration, batches, and capability discovery.
- Renderers own realization. Network transport never hides inside geometry creation.

The outer API stays small because deeper systems remain separate—not because their power was removed.
