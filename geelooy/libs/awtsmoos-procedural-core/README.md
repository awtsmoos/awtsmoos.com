# B"H — Awtsmoos Procedural Core

Boruch Hashem. Blessed is He.

> The Awtsmoos renews stone, tree, creature, river, and texture from one source of being; Awtsmoos.com keeps the public doorway simple while deeper specialist vessels remain available for precise seeing.

A renderer-neutral procedural world library for deterministic natural matter, geometry, materials, creatures, ecosystems, physics, and runtime adapters.

The package intentionally excludes application shells. Apps should normally begin with the high-level Nature API, then descend into specialist exports only when they need expert control.

## Nature API — recommended doorway

```js
import {
	createNatureApi
} from "/geelooy/libs/awtsmoos-procedural-core/src/index.js";

const nature = createNatureApi({
	seed: "gan-eden",
	quality: "high",
	realism: "extreme"
});

const stone = nature.rock("riverstone");
const oak = nature.tree("oak", { age: 0.72 });
const meadow = nature.grass({ density: 0.8 });
const flowers = nature.flowers("daisy", { count: 18 });
const deer = nature.creature("deer", { age: "adult" });
```

Every common operation is seedable and deterministic. Results are renderer-neutral data vessels; adapters decide how they become Three.js/WebGL/runtime objects.

## Natural stone

`nature.rock()` now uses the geological authority by default, so profile, erosion, fracture, strata, geometry, and material intent come from one physical model.

```js
const riverStone = nature.rock("riverstone", {
	radius: 1.4,
	seed: "river-bank-7"
});
```

Supported geological profiles include `fieldstone`, `boulder`, `riverstone`, `shard`, `granite`, `limestone`, and `basalt`.

For intentional art-direction through the older morphology engine:

```js
const stylizedShard = nature.rockMorphology("shard", {
	angularity: 0.95
});
```

The expert engine remains available; it simply no longer competes invisibly with natural geology.

## Materials and optional remote textures

Local procedural material planning never requires network access:

```js
const bark = nature.material("bark");
```

A host may inject any compatible texture generator:

```js
const nature = createNatureApi({
	seed: 613,
	textureGenerator: async request => ({
		provider: "my-texture-service",
		assets: await generateRemoteTextureAssets(request)
	})
});

const generated = await nature.generateTexture("bark", {
	resolution: 1024,
	channels: ["baseColor", "normal", "roughness"]
});
```

Generation is local-first. Results explicitly report `generated`, `failed`, `aborted`, or `unavailable`; the semantic local material remains available when remote work cannot complete. Pass `strict: true` only when provider failure should reject.

Historic `surface()` and `generateSurface()` calls remain compatibility aliases.

## Specialist domains

The facade also exposes specialist vessels for deeper work:

- `nature.rocks` — geological rocks, fields, and explicit morphology
- `nature.materials` / `nature.surfaces` — local materials and optional texture generation
- `nature.vegetation` — plants, grass, trees, botanical clusters
- `nature.forests` — forest composition
- `nature.creatures` — procedural creature creation
- `nature.ecosystems` — cross-domain ecological composition
- `nature.water` — rivers and water systems
- `nature.catalog` — supported natural-world catalogs

Use specialists when the simple verb is not expressive enough; do not reach into random internal files merely to bypass a facade.

## Low-level procedural geometry

The original geometry pipeline remains available:

```js
import {
	generateProceduralGeometry
} from "/geelooy/libs/awtsmoos-procedural-core/src/index.js";

const renderData = generateProceduralGeometry(
	"cube",
	{ size: 2, color: [0.2, 0.7, 1, 1] },
	[
		{ type: "subdivide", levels: 2 },
		{ type: "extrudeFaces", params: { distance: 1.2, scale: 0.5 } }
	],
	{ id: "query-tower" }
);
```

## Three.js adapter

```js
import * as THREE from "/games/scripts/build/three.module.js";
import {
	createProceduralThreeMesh
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/three/index.js";

const mesh = createProceduralThreeMesh(THREE, {
	primitive: "uvSphere",
	parameters: { radius: 1 },
	material: new THREE.MeshLambertMaterial({ color: 0x44aa88 })
});
```

## Architecture contract

- `src/core` owns deterministic renderer-neutral procedural truth.
- `src/core/natureApi` owns the simple natural-world facade and specialist semantic APIs.
- `src/adapters` converts core data into host/runtime objects.
- `src/runtime` may coordinate runtime behavior but must not redefine canonical procedural semantics.
- Remote providers are injected capabilities, never hidden dependencies of core generation.
- Public entrypoints preserve stable contracts; deeper modules may evolve behind them.

Tests live in `test/`. New public behavior should receive contract tests that prove determinism, failure semantics, compatibility, and bounded resource behavior rather than only asserting that a function exists.
