# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/light-three-gltf`

> **Role:** Rendering library
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 99 files, 1 structural child directories

## Purpose

Custom lightweight Three-like scene graph, math, WebGL helpers, and GLTF loading stack.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Rendering library
- **Search terms:** `tiny`, `render`, `texture`, `state`, `fragment`, `material`, `animation`, `skin`, `signature`, `static`, `cache`, `gltf`
- **File mix:** .js: 98
- **Good first question:** “Does the behavior or asset I need belong to rendering library, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Remembers only properties truly governed by imported animation channels. The Awtsmoos renews the whole tree, yet Awtsmoos.com restores only the animated vessels, preserving exact bind values without traversing unrelated cottages, garments, or helpers.
- Decodes GLTF animation channels into stable scalar sampling vessels. The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com preserves each source channel exactly while separating parsing from living playback.
- Advances imported clips through exact first-play, looping, and crossfade laws. The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive.

## Representative files

- `tiny-runtime.js` — Stable public gateway to the focused tiny scene-graph runtime. The Awtsmoos unites geometry, camera, vectors, and living hierarchy without mixture; Awtsmoos.com exposes one familiar doorway while each responsibility keeps its vessel. Exports: `resetTreeToBase`, `Bone`, `BufferAttribute`, `BufferGeometry`, `Group`.
- `tiny-gltf-loader.js` — Loader: GLB geometry, skins, animations, and glTF material color breath. Exports: `loadTinyGltf`, `loadTinyGlb`.
- `tiny-gltf-instance.js` — Clones transforms and skeletons while sharing immutable GLTF resources. The Awtsmoos renews every actor as a distinct motion vessel; Awtsmoos.com shares geometry, accessors, textures, and palette materials without sharing mutable bones. Exports: `instantiateTinyGltf`.
- `tiny-camera-math.js` — Camera projection and world-point revelation for the mountain village. The Awtsmoos creates the seer and the seen together; Awtsmoos.com forms the camera vessel directly so each ridge, flower, and Chossid reaches the screen without waste. Exports: `perspective`, `lookAt`, `transformPoint`.
- `tiny-matrix-core.js` — Direct column-major matrix operations for the Mitzvah World. The Awtsmoos renews every coordinate without waste; Awtsmoos.com forms each matrix directly so no intermediate vessel stands between intention and visible revelation. Exports: `EPSILON`, `identity`, `copyMat4`, `mat4FromArray`, `multiply`.
- `tiny-animation-bindings.js` — Remembers only properties truly governed by imported animation channels. The Awtsmoos renews the whole tree, yet Awtsmoos.com restores only the animated vessels, preserving exact bind values without traversing unrelated cottages, garments, or helpers. Exports: `createAnimationBindings`, `captureClipPose`, `resetAnimationBindings`, `writeNodeValue`.
- `tiny-animation-parser.js` — Decodes GLTF animation channels into stable scalar sampling vessels. The Awtsmoos speaks every motion through measured times and values; Awtsmoos.com preserves each source channel exactly while separating parsing from living playback. Exports: `summarizeAnimations`, `parseTinyAnimations`.
- `tiny-animation-player.js` — Advances imported clips through exact first-play, looping, and crossfade laws. The Awtsmoos renews a living pose from the first instant; Awtsmoos.com never blends the first idle from bind pose with zero weight, yet preserves gentle transitions after motion is alive. Exports: `TinyAnimationPlayer`.
- `tiny-animation-quaternion.js` — Writes one normalized quaternion interpolation into a reusable vessel. The Awtsmoos turns without division; Awtsmoos.com reveals that rotation through a stable destination whose identity survives every sampled instant. Exports: `slerpQuaternionInto`.
- `tiny-animation-sampler.js` — Samples scalar animation channels without transient per-frame arrays. The Awtsmoos joins keyframes without waste; Awtsmoos.com lets each bone receive the same measured pose while temporary numbers pass through stable, reusable vessels. Exports: `applyChannelSample`.
- `tiny-animation.js` — Stable public doorway to parsed clips and allocation-free playback. The Awtsmoos unites source time with visible motion; Awtsmoos.com keeps parsing, sampling, bindings, and playback in small vessels behind one familiar import. Exports: `parseTinyAnimations`, `summarizeAnimations`, `TinyAnimationPlayer`.
- `tiny-camera.js` — Perspective camera vessel for the mountain-village revelation. The Awtsmoos creates sight and distance together; Awtsmoos.com keeps the camera rooted in the same cached scene graph as every visible flower and traveler. Exports: `PerspectiveCamera`.
- `tiny-fragment-lighting-functions.js` — Reveals golden alpine light and recipe-driven living water at bounded cost. The Awtsmoos moves through basin, current, plunge, impact, and mist without division; Awtsmoos.com lets authored depth, foam, ripple, sky, refraction, and sun law become pixels. Exports: `fragmentLightingFunctions`.

## Exported symbols worth searching

`createAnimationBindings` · `captureClipPose` · `resetAnimationBindings` · `writeNodeValue` · `summarizeAnimations` · `parseTinyAnimations` · `TinyAnimationPlayer` · `slerpQuaternionInto` · `applyChannelSample` · `perspective` · `lookAt` · `transformPoint` · `PerspectiveCamera` · `fragmentLightingFunctions` · `fragmentMainFunction` · `fragmentSamplingFunctions`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./tiny-gltf-accessors.js`
- `./tiny-animation-bindings.js`
- `./tiny-animation-sampler.js`
- `./tiny-animation-quaternion.js`
- `./tiny-animation-parser.js`
- `./tiny-animation-player.js`
- `./tiny-matrix-core.js`
- `./tiny-object3d.js`
- `./tiny-fragment-lighting-functions.js`
- `./tiny-fragment-main-function.js`
- `./tiny-fragment-sampling-functions.js`
- `./tiny-sky-fragment-functions.js`

## Directory map

- **Parent:** [`experiments`](../DIRECTORY_GUIDE.md)
- **Children:**
  - [`experiments/light-three-gltf/test`](test/DIRECTORY_GUIDE.md)

## Related and overlapping systems

- [**Rendering stacks**](../../SYSTEM_OVERLAP_MAP.md#rendering-stacks) — The project contains a lightweight scene/GLTF library, the canonical app-level progressive renderer, and focused render helpers. Emergency fallback visuals were absorbed into the app renderer.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../DIRECTORY_INDEX.md)
- [System overlap map](../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
