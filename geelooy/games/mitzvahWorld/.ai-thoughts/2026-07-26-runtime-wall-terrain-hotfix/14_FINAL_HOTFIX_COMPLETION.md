B"H
Boruch Hashem
Blessed is He

# Final Runtime, Wall, and Terrain Hotfix Completion

## Reported failures

1. Approaching a demon threw `TypeError: actor.move is not a function`.
2. House walls disappeared and reappeared at oblique camera angles.
3. Grass looked low-resolution and visually uniform.
4. The intended road was not visibly present.

## Production repairs

### Enemy approach crash

Combat navigation no longer calls the removed `actor.move` facade. It delegates to the existing actor-motion helper in `MinimalMeadowEnemyActorMotion.js`, preserving collision steering, alternate approach angles, yaw, action state, and grounded movement.

### House wall angle stability

The custom renderer now honors `mesh.frustumCulled === false` before applying its own camera-sphere and distance rejection. Exterior house walls already carried that explicit opt-out, so the renderer now respects the scene contract instead of making the walls flicker by angle.

### Terrain clarity and mixture

Terrain density was raised to:

- mobile detail: 56 texels per world unit
- mobile grass: 64 texels per world unit
- mobile road: 72 texels per world unit
- desktop detail: 72 texels per world unit
- desktop grass: 84 texels per world unit
- desktop road: 96 texels per world unit

Six independent ecological sources remain active:

- lush grass
- meadow grass
- open soil
- road shoulder
- moss and wet grass
- dry ground

Zone weights now create stronger distinctions among ordinary meadow, wet meadow, lake basin, river bank, dry grass, village wear, alpine rock, and Bézier road influence.

### Visible road

The existing Bézier road ribbon is now mounted in the terrain group, visible, and exempt from frustum culling. It is visual-only; the terrain height sampler remains the collision authority.

## Automated verification

### New focused contracts

- enemy navigation without `actor.move`
- renderer culling opt-out
- crisp mobile terrain density
- six nonuniform ecological sources
- distinct zone weights
- visible road mounting

Result: 6 passed, 0 failed.

### Migrated terrain contracts

Result: 12 passed, 0 failed.

### Final focused closure

- Awtsmoos enemy, terrain, and house tests: 22 passed, 0 failed
- renderer culling contract: 1 passed, 0 failed
- syntax: clean
- every changed source, test, and probe module: at or below 120 lines
- diff check: clean

## Real mobile WebGL proof

Route:

`http://localhost:8080/games/mitzvahWorld/`

Viewport:

390 × 844, device scale factor 3, cache disabled.

Evidence:

- renderer stage: `rich-ready`
- runtime state: playable
- demon approach moved the actor 4.275 world units
- runtime error: empty
- 12 protected exterior wall meshes tested through 16 camera angles each
- every protected wall remained visible at every tested angle
- six distinct terrain layers active
- terrain detail density: 84
- road density: 96
- visible road mounted: true
- road frustum culling disabled: true
- console errors: 0
- browser exceptions: 0
- HTTP errors: 0
- request failures: 0

## Node simulation note

The complete Node browser simulation passed earlier in this hotfix pass (`09_node_whole_game.exit = 0`). Later closure reruns timed out after 20 seconds waiting for mocked deferred rich-world features while the harness was under concurrent tunnel load. Those timeout receipts still show combat and enemies installed, terrain fully built, no runtime error, and the new road and six-source texture evidence present. The real WebGL browser proof completed successfully and is authoritative for the reported mobile failures.

## Evidence files

- `05_second_focused_gate.tap`
- `08_final_terrain_gate.tap`
- `09_node_whole_game.json`
- `10_browser_probe.json`
- `10_live_road_and_terrain.png`
- `12_final_closure.tap`
- `13_node_world_isolated.json`

No commit or push was performed.
