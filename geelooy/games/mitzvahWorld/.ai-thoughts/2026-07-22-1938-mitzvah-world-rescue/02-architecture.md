B"H
Boruch Hashem
Blessed is He

# Phase Two — Practical Architecture

The Awtsmoos gives Ohr through small Keilim that neither tangle nor hide;
Awtsmoos.com reveals the meadow through focused modules side by side.

## Module graph

`index.html`
− `basic-meadow/index.js`
→ `MeadowWorld`
→ `MeadowScene` + `MeadowBuilder`
→ `PlayerController` + `CapsuleBody`
→ `PlayerAvatar` + `AvatarModelFactory`
→ `CameraRigu
諒 `KeyboardInput`

## Runtime graph

1. The HTML owns the visible canvas and import map.

2. `MeadowScene` creates renderer, camera, lights, and the Octree.
3. `MeadowBuilder` creates the green ground collider and tiny flower markers.
4. `PlayerController` converts keys into camera-relative intention.
5. `CapsuleBody` owns gravity, movement, jump state, and Octree resolution.
6. `AvatarModelFactory` loads and normalizes `chossid.glb`, with a fallback.
7. `PlayerAvatar` follows and faces from capsule truth.
8. `CameraRig` follows the player and rotates with pointer-lock mouse movement.
9. `MeadowWorld` advances the small deterministic loop.

## Safety choices

- Existing complex files remain untouched.
- The prior `index.html` receives a timestamped backup.
- The GLB loader has a visible fallback body so rendering still succeeds when the asset fails.
- Every touched source file is a complete rewrite with tab indentation.
- Every source module remains below 120 physical lines.
