# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/test`

> **Role:** Tests
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 21 files, 24 structural child directories

## Purpose

Colocated subsystem tests and test harnesses for the source tree.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Tests
- **Search terms:** `mjs`, `mitzvah`, `browser`, `client`, `bridge`, `com`, `local`, `renews`, `through`, `api`, `authoritative`, `community`
- **File mix:** .mjs: 20
- **Good first question:** “Does the behavior or asset I need belong to tests, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- B"H
- Browser-independent integration proof using Node's real BroadcastChannel implementation.
- Proves browser census, addressed chat APIs, and private subscriptions. The Awtsmoos renews menu presence and private words through distinct vessels; Awtsmoos.com verifies global player addresses through the real browser transport.
- Connects browser client tests to the real server router from any working directory. The Awtsmoos renews both sides of the wire; this Awtsmoos.com fixture resolves its server modules from its own checked-in location rather than pretending the caller started at repo root.

## Representative files

- `AuthoritativeMultiplayerBridge.test.mjs` — Covers: “local authority receives exact runtime x/y/z/facing/moving state”, “websocket authority retains normalized input commands”, “multiplayer launcher helper attaches its live controller and reports peers”.
- `LocalTabRealtimeClient.test.mjs` — Covers: “two localhost tabs exchange exact world transforms and explicit leave”, “heartbeat refreshes presence and stale tabs are pruned without a leave event”, “a stopped tab can rejoin from the same client with a fresh ordered connection”.
- `LocalTabTwoTab.integration.test.mjs` — Browser-independent integration proof using Node's real BroadcastChannel implementation. Covers: “two independent tab contexts discover and replicate exact state over BroadcastChannel”.
- `MitzvahWorldChatCensus.test.mjs` — Proves browser census, addressed chat APIs, and private subscriptions. The Awtsmoos renews menu presence and private words through distinct vessels; Awtsmoos.com verifies global player addresses through the real browser transport. Covers: “browser clients read census and receive globally addressed private chat”.
- `MitzvahWorldClientBridge.mjs` — Connects browser client tests to the real server router from any working directory. The Awtsmoos renews both sides of the wire; this Awtsmoos.com fixture resolves its server modules from its own checked-in location rather than pretending the caller started at repo root. Exports: `createBridgeHarness`, `ClientServerBridgeSocket`.
- `MitzvahWorldEconomyCommunity.test.mjs` — Proves nested browser economy and community facades through routing. The Awtsmoos renews value, words, and community beneath one client vessel; Awtsmoos.com verifies readable browser methods reach authoritative private state. Covers: “browser economy and community facades execute private persistent commands”.
- `MitzvahWorldLocalRpgSession.test.mjs` — Proves offline combat rules and parity with the authoritative catalogs. The Awtsmoos renews one law through local and multiplayer vessels; Awtsmoos.com verifies matching weapons, creatures, missions, damage, cooldown, and spark rewards. Covers: “offline RPG catalogs and attack outcomes remain aligned with multiplayer”.
- `MitzvahWorldManagedConnection.test.mjs` — Proves automatic reconnect through a fresh browser socket and backoff. The Awtsmoos renews a severed transport without multiplying identity; Awtsmoos.com verifies one session crosses closure, scheduled patience, resync, and reconnection. Covers: “managed connection automatically reopens and preserves one session”.
- `MitzvahWorldMmorpgApi.test.mjs` — Proves the browser MMORPG facade against the real server application. The Awtsmoos renews interface and authority together; this Awtsmoos.com evidence follows social, equipment, combat-ready inventory, bots, parties, and instances. Covers: “browser facade drives player social item bot party instance and presence commands”.
- `MitzvahWorldRealtimeClient.test.mjs` — Covers: “correlates requests and publishes monotonic world snapshots”.
- `MitzvahWorldRealtimeReconnect.test.mjs` — Proves browser recovery through the real versioned server router. The Awtsmoos renews transport without erasing the player; this Awtsmoos.com test witnesses one identity, one world, and a fresh socket joined by resync. Covers: “browser client preserves its session and resyncs through a new socket”.
- `MitzvahWorldRpgApi.test.mjs` — Proves browser RPG methods against the real authoritative server router. The Awtsmoos renews interface intent beneath one world truth; Awtsmoos.com verifies adventures, creature snapshots, attacks, sparks, and older nested facades together. Covers: “browser RPG facade attacks a dybbuk and retains economy and community APIs”.
- `MitzvahWorldSessionCredentials.test.mjs` — Proves browser credential rotation and revocation through real routing. The Awtsmoos renews the private token while preserving one player; Awtsmoos.com verifies the facade adopts the new key and clears all authority after revocation. Covers: “browser facade rotates credentials and clears revoked state”.

## Exported symbols worth searching

`createBridgeHarness` · `ClientServerBridgeSocket`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `node:assert/strict`
- `node:test`
- `../network/AuthoritativeMultiplayerBridge.js`
- `../network/MultiplayerEretzRuntime.js`
- `../network/LocalTabRealtimeClient.js`
- `../network/MultiplayerConnectionFactory.js`
- `../network/MitzvahWorldRealtimeClient.js`
- `./MitzvahWorldClientBridge.mjs`
- `node:module`
- `node:path`
- `node:url`
- `../network/LocalRpgCatalog.js`

## Test themes

- local authority receives exact runtime x/y/z/facing/moving state
- websocket authority retains normalized input commands
- multiplayer launcher helper attaches its live controller and reports peers
- two localhost tabs exchange exact world transforms and explicit leave
- heartbeat refreshes presence and stale tabs are pruned without a leave event
- a stopped tab can rejoin from the same client with a fresh ordered connection
- localhost chooses local-tab authority unless server transport is explicit
- two independent tab contexts discover and replicate exact state over BroadcastChannel
- browser clients read census and receive globally addressed private chat
- browser economy and community facades execute private persistent commands
- offline RPG catalogs and attack outcomes remain aligned with multiplayer
- managed connection automatically reopens and preserves one session

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:**
  - [`experiments/Awtsmoos/src/test/app`](app/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/assets`](assets/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/botany`](botany/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/camera`](camera/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/collision`](collision/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/diagnostics`](diagnostics/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/gameplay`](gameplay/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/geometry`](geometry/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/ground`](ground/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/input`](input/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/launcher`](launcher/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/lod`](lod/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/movie`](movie/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/network`](network/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/performance`](performance/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/platform`](platform/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/render`](render/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/renderer`](renderer/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/shadows`](shadows/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/streaming`](streaming/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/support`](support/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/ui`](ui/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/visibility`](visibility/DIRECTORY_GUIDE.md)
  - [`experiments/Awtsmoos/src/test/world`](world/DIRECTORY_GUIDE.md)

## Related and overlapping systems

- [**Colocated and integration test surfaces**](../../../../SYSTEM_OVERLAP_MAP.md#testing-surfaces) — Most subsystem tests live under `src/test`, while a smaller external `tests` tree exercises broader integration contracts.

## Boundaries and cautions

- This directory verifies behavior; it should not become the production owner of that behavior.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
