# B"H

Boruch Hashem

Blessed is He

# Awtsmoos Modeling Language

The Awtsmoos renews every point before polygon, every intention before modifier, and every texture name before remote bytes appear. Awtsmoos.com exposes that modeling truth as simple data: natural text, deterministic MeshScript, or JSON all become the same renderer-neutral `ModelingDocument`.

## Tiny public API

```js
import { AwtsmoosModel } from "/libs/awtsmoos-procedural-core/src/exports/modeling.js";

const model = AwtsmoosModel.fromText(
	'make a cylinder height 3m radius 40cm with 32 sides material stone texture "limestone" bevel width 0.02'
);

const explanation = AwtsmoosModel.explain(model);
const recipe = AwtsmoosModel.toProceduralObject(model);
```

`explanation.execution.native` lists what core can execute now. `adapter` lists preserved Blender/adapter work. Nothing unsupported is silently deleted.

## MeshScript

```text
mesh lamp
primitive cylinder radius 0.12 height 3 24 sides
material bronze texture "copper" mix "rust" strength 0.18
translate 0 0 1.5
modifier bevel width 0.015 segments 3
quality high
```

Compile with `AwtsmoosModel.fromScript(script)`.

## JSON / data

Use `AwtsmoosModel.fromData({...})` when an agent or application already has structured data. JSON does not pass through the prose parser.

## Real texture / RAG discovery

`AwtsmoosModel.search("stone")` searches primitives, operations, and the full canonical Awtsmoos Drive texture catalog. Texture records retain the real `{family,name,url}` fields. `resolveModelingTextureQuery()` chooses deterministic candidates but never downloads them.

Persistent caching, bitmap decode, map/mix hydration, and GPU upload remain responsibilities of the native texture adapter.

## Native execution today

The language can lower these existing renderer-neutral primitives directly into ProceduralObject commands:

- box / cube
- plane / grid
- cylinder
- cone / frustum
- UV sphere
- profile extrusion
- profile revolution / lathe
- indexed geometry data

The broader Blender modifier vocabulary is represented through the existing Blender modifier catalog. Operations such as bevel, boolean, mirror, subdivision, cloth, fluid, geometry nodes, shrinkwrap, array and many more remain marked `adapter` until a proven native executor exists.

## Why a semantic document exists

Text is not geometry. A `ModelingDocument` preserves names, objects, transforms, materials, ordered operations, quality policy, metadata, and diagnostics before any executor is chosen. That makes recipes diffable, searchable, cacheable, explainable, adapter-independent, and suitable for AI/RAG systems.
