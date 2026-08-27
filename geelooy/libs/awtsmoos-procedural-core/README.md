# B"H — Awtsmoos Procedural Core

A production shared library extracted from `geelooy/apps/Awtsmoos Procedural Worlds Creator/core`.

This package intentionally does **not** include the old creator app shell: no Vite UI, no scene picker, no startup script, no test-scene registry, and no app-specific renderer bootstrap.

It keeps the reusable engine systems together:

- procedural geometry primitives
- command/modifier pipeline
- face, edge, and vertex query systems
- CSG and boolean helpers
- tree generation system
- human, hair, mouth, eye, ark, cloud, house, and component generators
- skeleton, joints, IK, animation, shape keys, and speech helpers
- physics, raycast, cloth, metaball, and spatial systems
- WebGL shader/material modules
- Three.js adapters for converting generated render data into `THREE.BufferGeometry` and meshes

## Core usage

```js
import { generateProceduralGeometry } from "/geelooy/libs/awtsmoos-procedural-core/src/index.js";

const renderData = generateProceduralGeometry(
  "cube",
  { size: 2, color: [0.2, 0.7, 1.0, 1] },
  [
    { type: "subdivide", levels: 2 },
    {
      type: "extrudeFaces",
      params: {
        query: { normalDot: [0, 1, 0], count: 4 },
        distance: 1.2,
        scale: 0.5
      }
    }
  ],
  { id: "query_tower" }
);
```

## Three.js usage

```js
import * as THREE from "/games/scripts/build/three.module.js";
import { createProceduralThreeMesh } from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/three/index.js";

const mesh = createProceduralThreeMesh(THREE, {
  primitive: "cube",
  parameters: { size: 2 },
  modifiers: [{ type: "subdivide", levels: 1 }],
  material: new THREE.MeshLambertMaterial({ color: 0x44aa88 })
});
```

Custom shaders are supported by passing `shader`:

```js
const mesh = createProceduralThreeMesh(THREE, {
  primitive: "uvSphere",
  parameters: { radius: 1 },
  shader: {
    uniforms: { time: { value: 0 } },
    vertexShader,
    fragmentShader
  }
});
```

## Folder contract

`src/core` is copied as a complete engine core so its internal relative imports remain stable.
Apps should import through `src/index.js` or adapter entrypoints rather than reaching deep into random internals unless they need advanced systems.
