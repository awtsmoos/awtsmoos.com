B"H
Boruch Hashem
Blessed is He

# Final Priority Order

The Awtsmoos orders strength before ornament and truth before display,
Awtsmoos.com keeps each milestone small enough to prove and broad enough to stay.

## Priority 0 — Multiplayer default release gate

- Resolve the one failing client multiplayer contract.
- Unify session resolution.
- Make root URL multiplayer by default.
- Preserve explicit singleplayer and offline-local fallback.
- Add two-browser local and server acceptance.
- Verify reconnect, stale cleanup, world isolation, and status UI.

## Priority 1 — Shared gameplay authority

- Enemy, combat, loot, rewards, quest, NPC, and world-effect authority.
- Personal versus party versus world progress.
- Server validation, rate limits, anti-teleport, sequencing, and idempotency.
- Persistence migration and reconnect restoration.

## Priority 2 — Repair known world regressions

Close the seven existing bootstrap terrain, visible-world, stair, wall, and ground-boot failures before expanding the map. Multiplayer should not amplify known collision and visibility defects.

## Priority 3 — Loading and compact delivery

- Replace eager optional scripts with route/on-demand chunks.
- Split critical mission play from rich world.
- Reduce 16 eager stylesheets.
- Cache and compress the 2.03 MB Chossid model.
- Add measurable cold/warm budgets.
- Treat `compact=true` as insufficient without a real build artifact and manifest.

## Priority 4 — Four polished quests, not dozens of shallow quests

1. River Crossing.
2. Guard the Shul.
3. Great Spark Refinement.
4. Shepherd's Mercy.

Each must pass single-player, two-client, reconnect, persistence, mobile, and exact-reward tests.

## Priority 5 — Multiplayer UX and operations

- Persistent display identity.
- Peer count, latency, reconnect state, and server region.
- Join/leave notices.
- Party formation and invites.
- Mute/block/report before open chat.
- Admin diagnostics, abuse controls, and live server health.

## Priority 6 — Performance scalability

- Interest management by region.
- Remote actor LOD and animation throttling.
- Entity pooling and bounded effects.
- Server tick, message-rate, persistence, and load budgets.
- Long-duration multi-client leak and soak tests.

## Priority 7 — Broader content

Only after the above gates:

- More regions.
- Secrets and exploration.
- NPC routines.
- Audio and atmosphere.
- Equipment sets.
- Skill progression.
- Mounts and faster travel.

## Best next milestone

**Default Multiplayer Village Proof**

Open the root URL in two real browser contexts. Both players become controllable immediately, connect without blocking play, see one another with correct Chossid transforms, complete one shared road encounter, recover one server-authoritative corpse, disconnect, reconnect, and preserve identity and progress. Explicit singleplayer and offline-local fallback must still work.

This milestone should be completed before adding another major region or a large batch of new quest definitions.
