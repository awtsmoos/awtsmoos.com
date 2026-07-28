B"H
Boruch Hashem
Blessed is He

# Phase Two — Improved Architecture

The Awtsmoos joins immediacy with authority: the player moves at once, while consequence waits for truthful confirmation.

## Milestone One — Default session truth

- One pure resolver maps URL and environment to `multiplayer` or `singleplayer`.
- Missing session means multiplayer.
- Explicit `session=singleplayer` means no realtime bootstrap.
- Localhost may use local-tab transport unless server transport is explicit.
- The page dataset and diagnostics expose requested mode, transport, connection state, and fallback reason.

## Milestone Two — Lifecycle truth

- `idle`: constructed, not started.
- `connecting`: transport start requested.
- `connected`: transport open and join accepted.
- `ready`: initial authoritative snapshot applied and remote population attached.
- `reconnecting`: prior connection lost and retry scheduled/in flight.
- `offline-local`: network unavailable, local world remains playable.
- `closed`: explicitly destroyed, no timers/listeners remain.

## Milestone Three — Browser proof

A deterministic harness starts a static server, opens two isolated contexts, waits for first control independently of network readiness, then verifies mutual remote presence, transform replication, leave, stale pruning, reconnect, and world isolation.

## Milestone Four — Consequence authority

Create narrow envelopes instead of one giant multiplayer manager:

- Combat commands and snapshots.
- Loot claim and receipt.
- Quest event and authoritative projection.
- Reward transaction and idempotency key.
- World-effect command and version.

## Milestone Five — Performance

Instrument before optimizing. Record shell paint, first rendered frame, first control, local Chossid visible, quest ready, combat ready, multiplayer joined, and rich-world ready. Optimize only top contributors.

## Milestone Six — Content

Promote River Crossing after party/world authority exists. Keep rewards personal and exact-once; share bridge effects and coordinated stages.

## Verification pyramid

- Pure resolver tests.
- Lifecycle unit tests.
- Local-tab integration tests.
- Server protocol tests.
- Two-browser local acceptance.
- Two-browser WSS acceptance.
- Full app regressions.
- Performance budgets.
- Thirty-minute soak.
