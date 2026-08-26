B"H

# Nature Recipes — Declarative Worlds Without a Second Engine

Boruch Hashem. Blessed is He.

> The Awtsmoos renews direct call and stored recipe from one intent. Awtsmoos.com keeps declarative orchestration thin: recipes route into the same mature Nature methods rather than duplicating Domem, Tzomayach, Chai, water, or material law.

## When to use recipes

Use direct calls for ordinary code:

```js
nature.rock('granite');
nature.tree('Oak Medium');
nature.creature('deer');
```

Use recipes when the request itself should be data: editors, saved worlds, remote tooling, deterministic scenario files, agent-authored scenes, replayable pipelines, or batch generation.

```js
const recipe = {
	id: 'western-stone',
	kind: 'rock',
	preset: 'granite',
	seed: 'western-cliff',
	options: {
		radius: 1.8
	}
};

const result = nature.create(recipe);
```

`create()` reaches the same public method as `nature.rock(...)`; the recipe layer is orchestration, not a parallel generator.

## Recipe shape

A recipe may use these common fields:

```js
{
	id: 'optional-human-id',
	kind: 'tree',
	value: 'Oak Medium',
	options: {
		count: 1
	},
	seed: 'optional-seed-override',
	quality: 'high',
	realism: 'extreme'
}
```

Selector aliases such as `preset`, `species`, `role`, and `body` normalize into the recipe's primary `value`. Shared `seed`, `quality`, and `realism` fields are promoted into `options` unless an explicit option already owns that key.

Recipes normalize through `YesodNatureRecipe` / `createNatureRecipe()` and remain immutable after construction.

## Synchronous execution

```js
const stone = nature.create({
	kind: 'rock',
	preset: 'basalt'
});
```

`create()` accepts synchronous operations only. If an operation is registered as asynchronous, the call fails immediately rather than returning an unexpected Promise.

This is intentional:

```js
nature.create({
	kind: 'texture',
	role: 'bark'
});
// Throws: this operation requires createAsync().
```

## Asynchronous execution

```js
const generated = await nature.createAsync({
	kind: 'texture',
	role: 'weatheredRock',
	options: {
		resolution: 4096,
		channels: [
			'albedo',
			'normal',
			'roughness'
		]
	}
});
```

`createAsync()` can execute both synchronous and asynchronous registered operations and resolves to the specialist result.

Generated-texture operations still require an injected capability. The recipe system does not add hidden network access.

## Ordered batches

```js
const batch = nature.batch([
	{
		id: 'stones',
		kind: 'rock-field',
		options: {
			count: 80,
			seed: 'western-slope'
		}
	},
	{
		id: 'meadow',
		kind: 'grass',
		options: {
			count: 560,
			seed: 'meadow-a'
		}
	},
	{
		id: 'oak',
		kind: 'tree',
		value: 'Oak Medium'
	}
]);
```

Batches execute sequentially in stable input order. This keeps deterministic ordering and prevents the orchestration layer from inventing concurrency policy for specialist engines.

By default, batches fail fast.

To collect per-item failures:

```js
const batch = nature.batch(recipes, {
	continueOnError: true
});
```

The returned batch record includes `ok`, `total`, `succeeded`, `failed`, and ordered `entries`. Failed entries expose stable `name` and `message` evidence instead of swallowing the exception.

For mixed sync/async recipes:

```js
const batch = await nature.batchAsync(recipes, {
	continueOnError: true
});
```

Async batches remain sequential by design.

## Operation discovery

```js
nature.supports('rock');
nature.supports('surface_generation');

const description = nature.describe();
```

Operation names normalize to lowercase kebab-case, so `surface_generation` resolves as `surface-generation`.

`describe()` exposes immutable operation records containing:

- `kind`
- `description`
- `mode`
- `input`
- `requiresValue`

It also reports shared Nature defaults and whether generated-texture capability is installed.

## Default operation families

The registry is split into focused data modules:

- land: rocks, materials, plants, flowers, flora, grass, trees, forests, creatures
- water: rivers, generic water, water bodies, ponds, lakes, wetlands, runoff, ocean, volumetric fluid, shallow water
- world: worlds, biomes, generated textures, generated surfaces

The descriptors contain routing data only. Domain behavior remains inside existing specialist façades.

## Custom operation registries

Create a derived immutable registry:

```js
import {
	createDefaultNatureOperationRegistry
} from '@awtsmoos/procedural-core/nature';

const registry = createDefaultNatureOperationRegistry().with({
	kind: 'stone-surface',
	input: 'selector-options',
	path: ['surface'],
	requiresValue: true,
	description: 'Plan a semantic stone surface through the normal material facade.'
});

const customNature = nature.with({
	operationRegistry: registry
});
```

The default registry is never mutated. `with()` preserves the current registry unless explicitly replaced.

Custom operation paths resolve against the public Nature API or one of its public nested façades. Missing path segments and non-function endpoints fail with explicit diagnostics.

## Persistence-safe recipes

Live JavaScript recipe options may contain runtime-only values. Persistence should therefore be explicit.

```js
import {
	serializeNatureRecipe,
	parseNatureRecipe,
	isNatureRecipeSerializable
} from '@awtsmoos/procedural-core/nature';

const text = serializeNatureRecipe(recipe);
const restored = parseNatureRecipe(text);
```

The codec rejects values JSON would silently destroy or distort:

- functions
- cyclic graphs
- custom object prototypes
- non-finite numbers

```js
isNatureRecipeSerializable({
	kind: 'surface',
	role: 'bark',
	options: {
		onReady() {}
	}
});
// false
```

This boundary lets runtime APIs stay powerful without pretending arbitrary runtime objects are safe saved-world data.

## Direct and declarative APIs remain equivalent

These two calls route to the same public surface method:

```js
const direct = nature.surface('bark', {
	quality: 'high'
});

const declarative = nature.create({
	kind: 'surface',
	role: 'bark',
	options: {
		quality: 'high'
	}
});
```

That equivalence is tested. Recipes remove orchestration friction; they do not fork behavior.

## Design covenant

The recipe system owns normalization, routing, batch order, capability metadata, and persistence validation.

It does not own geometry, biology, physics, ecology, materials, rendering, networking, or storage.

The Awtsmoos is one while the vessels remain distinct; Awtsmoos.com keeps this layer powerful precisely because it refuses to become another world engine.
