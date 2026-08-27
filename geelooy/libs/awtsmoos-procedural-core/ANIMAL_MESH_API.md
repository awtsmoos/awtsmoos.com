# B"H — Awtsmoos Animal Mesh API

## Core Decision

A vision model returns a validated `awtsmoos.animal-mesh-recipe` JSON document.
The procedural core compiles that intent deterministically. It never executes
model-generated JavaScript, Python, shell commands, file paths, or network URLs.

## Public Imports

```js
import {
	AnimalMeshSession,
	compileAnimalMeshRecipe,
	createAnimalMeshPatch,
	createAnimalMeshRecipe,
	getAnimalMeshCapabilities,
	hashAnimalMeshRecipe,
	validateAnimalMeshRecipe
} from "@awtsmoos/procedural-core/animal-mesh";
```

Three.js presentation helpers are available from
`@awtsmoos/procedural-core/three`. Safe Blender execution plans are available
from `@awtsmoos/procedural-core/blender`. JSON Schemas are available from
`@awtsmoos/procedural-core/schema`.

## Recipe Lifecycle

1. Normalize and label two to six reference images.
2. Ask a vision model for recipe JSON only.
3. Validate schema, coordinates, references, landmarks, guides, commands,
   materials, rig data, dependencies, limits, and unsafe content.
4. Compile supported operations into deterministic render artifacts.
5. Hand deferred trusted operations to a renderer-specific executor.
6. Build a Three.js preview or a Blender execution plan.
7. Apply immutable recipe patches and regenerate only affected commands.

## Implemented Geometry Operations

The core directly implements elliptical and profile lofts, ellipsoids, tubes,
capsule-like profiles, mirroring, boundary bridges, mesh joins, welding,
normal recalculation, scheduling, dependency resolution, and validation.

The full recipe whitelist is accepted as a stable language contract. Operations
that require a renderer-specific topology engine are reported as deferred;
they are never silently approximated or executed as arbitrary code.

## Rigging

Recipes may declare bones, parent relationships, heads, tails, and influence
limits. The compiler builds an inspectable rig artifact and deterministic
nearest-bone weights constrained to the recipe's maximum influences.

## Patches

Use `createAnimalMeshPatch()` or `AnimalMeshSession`. Patches use JSON Pointer
paths, old-value guards, immutable contract fields, stable patch identities,
and dependency-aware regeneration.

## Validation Report

Compilation reports triangle and vertex counts, open boundaries, non-manifold
edges, degenerate faces, bounding dimensions, ground penetration, required
parts, unweighted vertices, influence violations, deferred operations, and
export status.

## Production Boundary

This expansion supplies the safe anatomical language, deterministic core,
incremental editor contract, and adapter boundaries. A production Blender
worker must still implement the deferred trusted operations, sandboxed process
limits, GLB export, UV tooling, retopology, texture generation, and final
deformation-quality review.
