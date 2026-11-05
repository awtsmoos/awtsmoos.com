# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src`

> **Role:** Experiments
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 1 files, 19 structural child directories

## Purpose

Subsystem root for the modular game runtime.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Experiments
- **Search terms:** `Awtsmoos`, `experiments`, `guide`, `src`
- **File mix:** .md: 1
- **Good first question:** “Does the behavior or asset I need belong to experiments, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H

## Representative files

- No immediate files. This directory is an organizational parent; follow the child guides below.

## Directory map

- **Parent:** [`experiments/Awtsmoos`](../DIRECTORY_GUIDE.md)
- **Children:**
  - [`experiments/Awtsmoos/src/app`](app/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/assets`](assets/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/bundles`](bundles/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/camera`](camera/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/collision`](collision/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/diagnostics`](diagnostics/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/gameplay`](gameplay/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/input`](input/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/launcher`](launcher/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/lod`](lod/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/math`](math/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/motion`](motion/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/movie`](movie/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/network`](network/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/performance`](performance/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/render`](render/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test`](test/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/ui`](ui/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/world`](world/DIRECTORY_GUIDE.md)

## Related and overlapping systems

- [**Meadow and fallback runtimes**](../../../SYSTEM_OVERLAP_MAP.md#meadow-runtimes) — The former basic and emergency meadow systems were consolidated into the live app stack. The app runtime and launcher now form the single meadow ownership path.
- [**Rendering stacks**](../../../SYSTEM_OVERLAP_MAP.md#rendering-stacks) — The project contains a lightweight scene/GLTF library, the canonical app-level progressive renderer, and focused render helpers. Emergency fallback visuals were absorbed into the app renderer.
- [**Terrain, materials, and asset preparation**](../../../SYSTEM_OVERLAP_MAP.md#terrain-materials) — Terrain geometry, runtime material policy, loaders, source textures, processed materials, and catalogs are split across runtime and asset trees.
- [**Procedural world and village generation**](../../../SYSTEM_OVERLAP_MAP.md#procedural-world) — Village, road, house, primitive, text-driven, and public API systems collaborate but are maintained in separate directories.
- [**Vegetation, trees, and forest systems**](../../../SYSTEM_OVERLAP_MAP.md#vegetation) — Botany rules, tree generation, forest composition, grass, and source texture libraries overlap semantically but own different layers.
- [**Combat domain, action bars, targeting, and HUD**](../../../SYSTEM_OVERLAP_MAP.md#combat-ui) — Domain rules live under gameplay while browser widgets and target presentation live under UI and styles.
- [**Colocated and integration test surfaces**](../../../SYSTEM_OVERLAP_MAP.md#testing-surfaces) — Most subsystem tests live under `src/test`, while a smaller external `tests` tree exercises broader integration contracts.
- [**Movie runtime, projects, tools, and evidence**](../../../SYSTEM_OVERLAP_MAP.md#movie-pipeline) — Runtime movie logic is separated from authored projects, exact-generation tools, and captured evidence.
- [**Diagnostics, logs, tools, and root audits**](../../../SYSTEM_OVERLAP_MAP.md#diagnostics) — Live diagnostics, captured logs, offline tools, and root audit reports describe different stages of observability.
- [**Player, creature, horse, enemy, and experimental mesh systems**](../../../SYSTEM_OVERLAP_MAP.md#actors-creatures) — Actor assets and world-side populations span player hydration, creature generators, enemies, horses, and experimental animal meshes.
- [**Streaming, LOD, visibility, and performance policy**](../../../SYSTEM_OVERLAP_MAP.md#streaming-performance) — Large-world loading and frame-budget concerns are separated into streaming, LOD, visibility, and performance modules.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
