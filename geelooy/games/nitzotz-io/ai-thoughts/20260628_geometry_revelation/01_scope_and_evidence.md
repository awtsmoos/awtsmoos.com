# B"H — Scope and Evidence

## User surface request
Repair `games/nitzotz-io` because geometry is broken and the procedural shape system is too weak. Use or improve `libs/awtsmoos-procedural` or `libs/awtsmoos-procedural-core`.

## Observed project shape
- Game path: `games/nitzotz-io`.
- Current game is raw browser ES modules, raw WebGL, no bundler.
- Current renderer hardcodes primitive functions in `js/webgl.js`.
- Current engine maps semantic object names to symbolic shapes in `js/engine/meshes.js`.
- Existing procedural package emits raw `{ positions, indices, colors }` mesh data and has validation helpers.

## First evidence
- The game is tiny and modular, but many geometry functions are cramped into one `webgl.js`.
- The procedural package is already meant for Nitzotz raw WebGL stabilization.
- The procedural package currently lacks normals and a shape catalog usable by the renderer.

## Completion target
A better game geometry pipeline means the renderer should consume procedural mesh data, compute finite normals, include richer procedural shapes, and expose validation tests that prove the meshes are sane before the browser draws them.
