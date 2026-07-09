# B"H — AWTS OOS 3D Runtime Guide

This parallel runtime uses the existing custom WebGL + GLTF stack. It does **not** import THREE or GLTFLoader.

## Start page

`examples/eretz-ground.html`

## Current features

- Real `chossid.glb` loaded through the custom tiny GLTF loader.
- Custom WebGL renderer, skinning, hierarchy, and animation.
- One-time ground alignment: the model's lowest foot vertex is ray/drop aligned to Eretz y=0 at load.
- Joystick and keyboard movement.
- Camera-relative movement: forward/back/sideways are relative to the orbit camera yaw.
- Desktop/touch camera orbit around the chossid, with wheel zoom.
- Automatic `stand_Armature` / `walk_Armature` clip switching.
- Real 3D Eretz ground and obstacle meshes.
- Real grass texture from the old system: `https://awtsmoos-docs-base.web.app/half-resolution/grass%201.png`.
- Custom shader mirrored-repeat/ping-pong texture sampling.
- Scratch AABB octree for player collision and camera clipping.
- Wall-slide mover with depenetration for wall contact.

## Next

- Add slope/heightfield terrain raycasts.
- Upgrade collision to capsule-vs-triangle narrow phase.
- Move broadphase and input snapshots to workers after the 3D path is stable.
