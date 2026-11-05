# B"H — MitzvahWorld / Reality Engine Mission Plan
**Date:** 2026-10-12 · **Authority:** Yaakov (direct order, evening push)
**Scope:** MMORPG multiplayer, obstacle courses (built-in + player-built), realism upgrades, particles + coins — on top of the 4 standing repair tasks (Task 1 done; Tasks 2/3/4 must keep working).

## Non-negotiable constraints
1. **Do not revert** Task 1 (renderer contract + 60fps baseline) or Task 2 (instant-start meadow slice). All new work extends `buildRealityScene()` / `experiments/Awtsmoos` — never replaces.
2. **Render bar:** full first-render (first meaningful frame) must complete in a few seconds. Every realism improvement must be measured against `?fast=1` timing; anything that breaks the budget gets split to progressive load or killed.
3. **No blocky/Minecraft-like output.** All new meshes use the procedural generator or real textures.
4. **Never fake tests.** Every claim below must be verified against the actually running game (browser render / node test with real output). Screenshots over assertions.
5. **CSS LAW 1–8:** no `!important`, full states, light/dark explicit colors, token-only colors, zero validator errors, reference-image-first (LAW 8).

## Phase order
### Phase 1 — Reality Engine realism upgrade (photoreal/, meadow slice)
- Volumetric-ish sun god-rays (cheap shader, no postprocessing chain), time-of-day lighting presets, sky-dome gradient, ground fog density zones.
- Richer particles: rain/spray near river, wind gusts on pollen/leaves, firefly swarm density doubling at dusk; keep total draw calls ≤ budget.
- Acceptance: `reality.html?view=forest&fast=1` first frame ≤ 3 s on VM; screenshot review at full res shows no regression, visible atmosphere improvement; existing particle test suite still green.

### Phase 2 — Coin collection + movement polish (experiments/Awtsmoos)
- Coin pickups (spinning meshes, magnet radius, HUD counter, save to player profile), jump/glide physics tuning, camera follow smoothing.
- Acceptance: headless gameplay test — spawn, collect 10 coins via simulated input, counter = 10, positions deterministic from seed; FPS counter stays ≥ 55 during collection burst.

### Phase 3 — Built-in obstacle courses (new: `experiments/Awtsmoos/src/courses/`)
- Course system: checkpoints, timer, respawn, moving platforms (sinusoidal + path-following movers with carry-physics), rotating hazards, realistic surface friction.
- Ship 3 built-in courses: `meadow-dash` (easy), `river-gap` (medium, moving platforms over water), `canopy-climb` (hard, vertical + rotating arms).
- Acceptance: each course completable by the auto-playtest bot in < par time; no physics tunneling through platforms (swept-collision check); checkpoint respawn ≤ 250 ms.

### Phase 4 — Player-built courses + front page
- Builder mode: place platforms/movers/checkpoints/coins from palette, drag on grid, save course JSON to server (`/api/courses`), play instantly.
- Front page (`courses/index.html`): card grid of all published courses (built-in + player-made), filter/search, "Play" and "Remix" buttons, LAW 8 reference image.
- Acceptance: create → save → reload → play flow works in live browser without dev tools; course JSON round-trips byte-identical; front page loads in < 2 s with 100+ courses listed.

### Phase 5 — MMORPG multiplayer networking
- Authoritative-lite: Node WebSocket server (`server/mp-net/`), 20 Hz snapshot broadcast, client prediction + reconciliation, player avatar replication (head coverings on all humans), lobby/zone shards of ≤ 24 players.
- Security: rate-limit movement packets, server clamps positions, no raw eval.
- Acceptance (verified, not claimed): two real browser clients + N bots in one zone; measured: tick 20 Hz ± 2 Hz, p99 update-to-render latency < 120 ms on LAN, 0 desyncs over 5-minute soak, ≥ 55 fps on client with 24 avatars; soak log saved to `proof/`.

### Phase 6 — Integration + publish
- Merge courses + coins + multiplayer into the meadow build, LAW 8 UI pass on HUD/menus, production build, deploy, live verification.

## Dependencies
- Phase 2 needs Phase 1's particle budget locked (draw-call ceiling).
- Phase 4 needs Phase 3's course format (JSON schema frozen in Phase 3).
- Phase 5 needs Phase 2's player physics (single-player movement must be solid first) and Phase 4's course loader (multiplayer runs in courses).
- Task 3/4 repairs (gen-loop budget, grass) land independently but must not change the course/platform physics API once frozen.

## Current state (2026-10-12 ~03:45 EDT)
- Task 1 done (.task1_done). No multiplayer code exists anywhere in the tree (verified: no WebSocket/RTCPeerConnection/server code).
- Reality Engine: `buildRealityScene()` in `photoreal/js/`; particles in `reality-particles.mjs`; character in `reality-character.mjs`.
- Phase 1 started: lighting/atmosphere work on `reality-scene.mjs`.
