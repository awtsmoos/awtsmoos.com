# B"H

Boruch Hashem

Blessed is He

# Peruta Run / Subway Surfer — Short Handoff

The Awtsmoos renews runner, road, texture, obstacle, and input before another Shliach enters the street;
Awtsmoos.com lets this note stay small, so takeover begins from living evidence instead of history beneath the feet.

## Snapshot

- Route: `geelooy/games/mitzvahWorld/subwaySurfer/`
- API: **2.3.0**
- Boot token: **`release-20260901-1`**
- Browser API: `globalThis.AwtsmoosPerutaRun`
- Observed HEAD when written: `e5e4909d1`
- Route was clean before this handoff was added; re-check Git because other agents work concurrently.

## Gameplay

Three-lane endless runner. Collect Perutas.

Controls: A/Left = left, D/Right = right, W/Space = jump, S/Down = duck, P = pause, R = restart. Mobile uses swipe plus touch controls.

Collision laws stay only:

- `avoid`
- `jump`
- `duck`

Do not restore impossible jump→duck / duck→jump required sequences. Current hard patterns use fair simultaneous center jump/duck decisions.

## World theme

Obstacle families:

`transport`, `market`, `maintenance`, `eruv`, `community`.

Examples: supply wagons, produce carts, awnings, repair crates, scaffold braces, eruv maintenance equipment, folding-chair racks, cable ramps.

The eruv itself is respectful city context; ordinary maintenance equipment carries gameplay collision. Never use Torah scrolls, tefillin, mezuzos, sifrei kodesh, or sacred Judaica as disposable hazards.

## Textures + realism

Use semantic photographic roles from `PerutaSurfaceCatalog.js` and procedural core. Never duplicate raw remote texture URLs in game code.

Materials are shared, hydration is non-blocking/cached, and fallback colors remain playable while images load.

Texture evidence:

`AwtsmoosPerutaRun.inspect("diagnostics").surfaces`

## Public API

Keep the surface simple:

- `state()`
- `command(name, payload?)`
- `inspect(name)`
- `on(eventName, listener)`

Do not expose Three.js nodes or mutable runtime state.

Main evidence call:

`AwtsmoosPerutaRun.inspect("diagnostics")`

It includes API/profile, FPS, draw calls, triangles, camera/body state, textures, and semantic obstacles.

## UI

HUD stays minimal. Advanced information belongs in the retractable **Advanced** drawer.

Drawer behavior: owns its pause, traps focus, closes with Escape/backdrop/button, restores focus, shows live evidence, and offers Auto/Mobile/Balanced/Cinematic reloads.

Keep CSS localized under `.peruta-run-route`; preserve 48px touch targets plus hover, active, focus-visible, and reduced-motion states.

## Key files

- `src/main.js`
- `src/runtime/PerutaRunApplication.js`
- `src/runtime/PerutaRunBootGraph.js`
- `src/runtime/PerutaRunRuntimeGraph.js`
- `src/api/PerutaRunApi.js`
- `src/world/ChunkPatternCatalog.js`
- `src/world/ObstacleFactory.js`
- `src/realism/PerutaPhotographicSurfaceLibrary.js`
- `src/ui/AdvancedDrawerController.js`

Deep docs: `docs/API.md`, `docs/TEXTURE_SURFACES.md`, `docs/OBSTACLE_SYSTEM.md`.

## Next agent

1. Re-check Git HEAD/status.
2. Boot mobile + desktop.
3. Confirm API 2.3 and exercise lane/jump/duck/pause/restart/drawer.
4. Verify texture states progress toward `ready`.
5. Record FPS/calls/triangles and active obstacle diagnostics.
6. Change code only from observed failures/new requirements.

Do not regress semantic obstacle IDs, texture caching, pooled world geometry, localized CSS, public-API immutability, full-file rewrites, or the project's modular source-size rules.
