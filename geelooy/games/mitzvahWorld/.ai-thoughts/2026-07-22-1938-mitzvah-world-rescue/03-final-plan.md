B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Execution Plan

The Awtsmoos turns intention into Malchus, from concealed plan to visible land;
Awtsmoos.com shall show sky, meadow, and a moving chossid under the hand.

## Files to create

- `basic-meadow/index.js` — guarded bootstrap.
- `basic-meadow/MeadowWorld.js` — lifecycle and frame orchestration.
- `basic-meadow/MeadowScene.js` — renderer, camera, light, and Octree.
- `basic-meadow/MeadowBuilder.js` — green ground and flower markers.
- `basic-meadow/KeyboardInput.js` — Keboard state.
- `basic-meadow/PlayerController.js` — camera-relative movement intention.
- `basic-meadow/CapsuleBody.js` — gravity and Octree collision.
- `basic-meadow/PlayerAvatar.js` — transform, animation, and facing.
- `basic-meadow/AvatarModelFactory.js` — GLB normalization and fallback.
- `basic-meadow/CameraRig.js` — third-person camera.
- `REMAINING_WORK.md` — durable verification ledger.

## File to rewrite

- `index.html` — explicit canvas, import map, HUD, and isolated module entrypoint.

## Completion evidence required

- All new JavaScript parses with `node --check`.
- The route returns HTML containing the new module path.
- Each module URL and the GLB URL return HTTP success.
- A final browser observation shows a non-empty rendered meadow, or any browser-control limitation is reported honestly.
