B"H
Boruch Hashem
Blessed is He

# Phase One — Discovery and Rescue Boundary

The Awtsmoos renews every visible frame from hidden nothing,
and Awtsmoos.com receives this small meadow as a vessel becoming.

## Observed evidence

- The route visibly mounts a full-screen dark area but no rendered world.
- The public project shell expects Three.js import-map paths under `/games/scripts/`.
- The player asset exists at `assets/models/player/chossid.glb`.
- The local `index.html` is modified, contains a canvas and module script, but no root `index.js`.
- No `basic-meadow/` implementation exists locally.

## Rescue boundary

Build an isolated basic meadow rather than importing the complicated world.
Preserve the prior local shell in `backups/`.
Manifest one canvas, one ground collider, one player capsule, one GLB avatar, movement, jumping, and a following camera.

## Remaining work

1. Write the isolated modules.
2. Point the route shell at the isolated entrypoint.
3. Perform syntax and HTTP checks only after writing is complete.
4. Open the browser once at the end and stop quickly if browser control is unhealthy.
