B"H
Boruch Hashem
Blessed is He

# Current Reality

The Awtsmoos reveals the difference between a promised door and the door players truly cross,
Awtsmoos.com preserves each observed seam so future work is not built upon loss.

## Multiplayer reality

- `MitzvahWorldSessionMode.js` already defaults world routes to multiplayer.
- `MitzvahWorldDirectRoute.js` explicitly writes `session=multiplayer`.
- `MitzvahWorldLauncher.js` routes `mode=world` to multiplayer unless `session=singleplayer` is explicit.
- The actual root `index.html` bypasses that launcher and loads `MinimalSharedMeadowPage.js`.
- `MinimalSharedMeadowPage.js` currently defaults missing session parameters to `singleplayer`.
- Therefore the production root and the architectural launcher disagree.

## Multiplayer implementation reality

Present systems include:

- Local-tab BroadcastChannel authority for localhost.
- Public WebSocket authority for deployed hosts.
- Bounded request and socket timeouts.
- Automatic reconnect with backoff and preserved session identity.
- Remote Chossid population and exact transform replication.
- Offline-local continuation when server connection fails.
- Server persistence for world, combat, economy, community, identity, and session state.

## Multiplayer verification reality

- Selected client contracts: 15 passed, 1 failed.
- The failure is `multiplayer launcher helper attaches its live controller and reports peers`, where diagnostics observed connection state `idle` instead of `connected`.
- The connection owner itself sets `connected`; the failure appears to expose an asynchronous readiness contract or test timing race. It must be resolved before default activation.
- Nine selected server test files covering application, session, idempotency, identity, security, persistence, combat, economy, and MMORPG state exited successfully.
- Existing local-tab tests prove two in-memory clients exchange transforms, leave, prune stale peers, and rejoin.
- No browser acceptance test proves two actual game pages on the default root URL see each other.
- No public deployed WebSocket acceptance test proves the production page connects to the production authority.

## Quest reality

- The catalog already contains 13 Shlichus definitions.
- Most are compact data records, not polished authored arcs.
- `The Light at the River Crossing` is the strongest deep follow-up quest, with six stages and a permanent bridge-light world effect, but is marked `multiplayer: false`.
- The Adventure Store supports offers, progress, pins, persistence, and synchronization, but shared-versus-personal authority needs an explicit multiplayer contract.

## Loading reality

- The live feature phase previously required about 19.7 seconds to become ready.
- The core runtime renders and moves before deferred features complete.
- `index.html` eagerly loads 16 stylesheets and 3 module entry scripts.
- The canonical Chossid GLB is 2,027,368 bytes.
- The normal route eagerly loads mobile integration and the universal API explorer even when the player does not need them.
- `?compact=true` is a URL flag; it is not proof of a bundled or minified JavaScript artifact.
- Source minification is not desirable. Real compactness should come from route-level chunks, fewer imports, compressed assets, and deferred optional systems.

## Existing quality debt

Seven full app-suite failures remain in bootstrap terrain, visible world, stair continuity, wall surface policy, and player-ground boot visibility. These should be repaired before major content expansion because multiplayer multiplies every world defect across clients.
