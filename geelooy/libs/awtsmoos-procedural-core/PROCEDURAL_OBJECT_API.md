# B"H — Awtsmoos Procedural Object API

## Purpose

The procedural-object API is a renderer-neutral, deterministic modeling language.
It describes geometry, scene structure, materials, rigs, animation, simulation
intent, and exports without executing model-generated code.

## Recipe Envelope

A recipe uses `awtsmoos.procedural-object-recipe` version `1.0.0` and contains:

- Stable asset and recipe identity.
- Coordinate-system declarations.
- Reusable definitions.
- Materials and initial objects.
- Dependency-ordered whitelisted commands.
- Output declarations, validation rules, metadata, and uncertainties.

## Universal Geometry Artifact

Every geometry is the full portable equivalent of a buffer-style geometry:

- Arbitrary named attributes.
- Explicit component type and item size.
- Indexed or non-indexed topology.
- Triangles, strips, fans, lines, loops, and points.
- Groups, draw ranges, and material slots.
- Multiple morph targets.
- Bounds and semantic metadata.
- Skin indices, skin weights, colors, tangents, custom scientific fields, or
  any other bounded numeric attribute.

The core stores JSON-safe arrays. `@awtsmoos/procedural-core/awtsmoos` can
materialize them as typed arrays without importing a rendering engine.

## Core Operations

The deterministic core creates primitives, raw indexed geometry, extrusions,
revolutions, transforms, mirrors, merges, arbitrary attributes, indices,
groups, morph targets, object hierarchies, instances, materials, cameras,
lights, collections, sockets, constraints, custom properties, armatures,
animations, drivers, LOD metadata, and scene metadata.

## Trusted Adapter Operations

Operations requiring a specialized engine are preserved as structured deferred
commands. The catalog covers curves, NURBS, surfaces, text, volumes, booleans,
mesh editing, modifiers, Geometry Nodes, UV work, shaders, baking, cloth,
fluids, smoke, fire, rigid bodies, particles, hair, fur, oceans, rendering,
compositing, and export.

A Blender worker may implement these commands through maintained `bpy` code.
The recipe itself never contains Python, JavaScript, shell commands, URLs,
filesystem paths, or arbitrary source.

## Domain Profiles

Animal anatomy is one profile over the universal language. Built-in profiles
also cover generic objects, architecture, terrain, products, and effects.
Applications may register additional semantic profiles and trusted namespaced
operations such as `ext:studio/custom-operation`.

## Incremental Editing

Use `ProceduralObjectPatchBuilder` and `ProceduralObjectSession` to apply
immutable JSON-Pointer patches. Only directly affected commands and their
dependants are regenerated.

## Adapters

- `./awtsmoos`: primary renderer-neutral typed-array runtime.
- `./blender`: safe structured execution plans.
- `./three`: optional legacy compatibility adapter.
- `./animal-mesh`: anatomical recipe specialization.
- `./procedural-object`: universal public API.
