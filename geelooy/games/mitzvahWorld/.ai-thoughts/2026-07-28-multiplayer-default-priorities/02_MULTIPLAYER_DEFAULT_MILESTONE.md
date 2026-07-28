B"H
Boruch Hashem
Blessed is He

# Multiplayer Default Milestone

The Awtsmoos joins many travelers without delaying the first living step,
Awtsmoos.com keeps each identity, world, reconnect, and fallback honestly kept.

## Goal

Opening `/geelooy/games/mitzvahWorld/` with no query parameters starts multiplayer automatically. Explicit `?session=singleplayer` remains available. Multiplayer connection must never block first playable control.

## Required implementation order

1. Resolve the failing client connection-state contract.
2. Make one canonical session resolver own both launcher and compact meadow entry.
3. Change the root default from singleplayer to multiplayer.
4. Keep explicit single-player and explicit local/server transport overrides.
5. Display a truthful state sequence: connecting → connected / reconnecting / offline-local.
6. Preserve local play when realtime is unavailable.
7. Add browser-level acceptance before calling the milestone complete.

## Browser acceptance matrix

### Default root

- Root URL reports multiplayer or multiplayer-connecting without query parameters.
- `?session=singleplayer` reports singleplayer and opens no realtime transport.
- Offline server does not delay first controllable frame.

### Two actual local pages

- Two browser contexts join the same `worldId`.
- Each page observes one remote peer.
- Exact x/y/z, facing, moving, run mode, and animation clip replicate.
- Remote model appears, updates smoothly, and disappears on clean leave.
- Crashed or stale page disappears after the presence timeout.
- Reopened page preserves or deliberately renews identity according to the documented rule.

### World isolation

- Different `worldId` values never see one another.
- Duplicate join is idempotent.
- Late join receives the current authoritative snapshot.

### Public server

- Production route opens a real WSS connection.
- Authenticated identity binds to one player.
- Reconnect preserves the session and replays the current world.
- Invalid, replayed, unauthorized, oversized, and rate-exceeding messages are rejected.

## Gameplay authority decisions required

Player transforms alone are insufficient. Define authority for:

- Enemy health, aggression, death, and respawn.
- Corpse ownership and loot transactions.
- Quest progress: personal, party-shared, or world-shared.
- NPC conversation and mission availability.
- Inventory and rewards.
- Permanent world effects.
- Day/time and regional events.

## Recommended model

- Server authoritative for combat, loot, rewards, persistence, and shared world effects.
- Client prediction for local movement with bounded correction.
- Personal quest records by default.
- Explicit party-shared objectives for co-op missions.
- World-shared effects only after server-confirmed completion.

## Completion gate

- All selected client and server multiplayer tests pass.
- Two-browser local-tab acceptance passes.
- Two-browser real-server acceptance passes.
- Default root is multiplayer.
- Explicit singleplayer still passes.
- Offline-local fallback passes.
- First control and feature budgets do not regress.
- No duplicated remote actors, listeners, badges, or reconnect timers after 30 minutes.
