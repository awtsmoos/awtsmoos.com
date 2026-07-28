B"H
Boruch Hashem
Blessed is He

# Loading and Compact Runtime Plan

The Awtsmoos reveals the first playable light before every distant garment is worn,
Awtsmoos.com keeps optional weight beyond the threshold where control is born.

## Current evidence

- Previous live feature readiness: approximately 19.7 seconds.
- Eager root stylesheets: 16.
- Eager root module entries: 3.
- Canonical Chossid GLB: 2,027,368 bytes.
- Core launcher/runtime/network source is relatively small; assets and imported feature graphs dominate.

## Compact JavaScript principle

Do not minify repository source or compress functions into unreadable lines. Build compact delivery artifacts instead:

- Route-level production bundles.
- Explicit chunks with stable content hashes.
- Tree shaking.
- Gzip/Brotli transfer compression.
- Deferred optional entries.
- Import-map or manifest validation.
- Source maps retained outside the critical route.

## Loading tiers

### Tier 0 — first control

- Terrain/collision floor.
- Camera and input.
- Placeholder local player.
- First rendered frame.
- Start multiplayer connection in parallel.

### Tier 1 — playable mission

- Canonical local Chossid.
- Combat core.
- Current pinned Shlichus.
- Essential NPC giver.
- Connection/status UI.

### Tier 2 — nearby richness

- Nearby enemies and friendly NPCs.
- Road, bridge, houses, water.
- Equipment visuals.
- Audio for current region.

### Tier 3 — optional richness

- Distant vegetation.
- API explorer.
- Diagnostics panels.
- Movie/editor systems.
- Unopened menu panels.
- Mobile integration on non-touch desktop.

## Highest-value loading changes

1. Remove `MinimalUniversalApiExplorer.js` from normal eager boot; load it only when opened.
2. Load mobile integration only for touch/coarse-pointer devices.
3. Consolidate or route-scope the 16 eager stylesheets.
4. Split `MinimalMeadowFeatureBundle` into mission-critical and rich-world chunks.
5. Cache one parsed Chossid template, then clone/instance it for local, NPC, and remote actors.
6. Compress the GLB with mesh/texture compression supported by the runtime.
7. Add long-lived immutable cache headers and a versioned service-worker cache.
8. Measure module count, transfer bytes, parse time, GLB decode time, and first useful interaction.

## Performance budgets

Suggested cold midrange-device gates:

- Loading shell paint: under 500 ms.
- First controllable frame: under 3 seconds.
- Warm first control: under 1.5 seconds.
- Current quest and combat ready: under 5 seconds.
- Local canonical Chossid visible: under 5 seconds.
- Rich nearby world: under 10 seconds.
- Multiplayer connection never blocks first control.

## Remote-player performance

- Shared parsed model template.
- Distance-based animation updates.
- Interest management by region.
- Adaptive remote-player cap.
- Proxy silhouettes at distance.
- No full animation work for hidden or dormant peers.
- Pool nameplates and remote status UI.

## Verification

- Cold and warm browser traces.
- Slow 4G and throttled CPU profiles.
- Low-memory mobile test.
- Cache-hit and cache-miss acceptance.
- Two-client boot budget test.
- Thirty-minute leak test covering actors, WebSockets, BroadcastChannels, timers, DOM overlays, and GPU resources.
