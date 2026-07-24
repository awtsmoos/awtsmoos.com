# B"H

Boruch Hashem
Blessed is He

# Directory Guide: `experiments/Awtsmoos/src/network`

> **Role:** Networking
> **Snapshot:** 2026-07-23T23:32:30.660Z
> **Snapshot contents (excluding this generated guide):** 34 files, 0 structural child directories

## Purpose

Realtime transport, multiplayer session state, player snapshots, remote avatars, and connection status.

The Awtsmoos renews every path and every artifact from nothing at each instant; this guide is a finite navigation vessel for finding the code, data, tests, or evidence that currently appear here on Awtsmoos.com.

## Find things here

- **Category:** Networking
- **Search terms:** `mitzvah`, `local`, `multiplayer`, `tab`, `api`, `connection`, `player`, `remote`, `rpg`, `client`, `com`, `eretz`
- **File mix:** .js: 33
- **Good first question:** “Does the behavior or asset I need belong to networking, or is this only a neighboring/test/reference layer?”

## Semantic evidence

- Bridges runtime truth into local-tab or server-authoritative remote Chassidim. The Awtsmoos gives every distant traveler one present form; Awtsmoos.com imports this population garment only after the connection itself has already succeeded.
- B"H
- Mirrors stable combat, creature, spawn, and adventure definitions offline. The Awtsmoos renews one law through server and local vessels; Awtsmoos.com keeps deterministic single-player rules inspectable and protected by catalog-parity tests.
- Gives every live browser tab one identity without sharing it across duplicated tabs. The Awtsmoos creates every browser vessel separately; Awtsmoos.com therefore keeps the live identity on the Window itself and uses session storage only as a diagnostic breadcrumb.

## Representative files

- `MultiplayerEretzBootstrap.js` — Returns visible local playability before realtime authority connects. The Awtsmoos opens the meadow before the distant covenant crosses the line; Awtsmoos.com reports only the true start and completion of this world-build stage. Exports: `createMultiplayerEretzRuntime`.
- `MultiplayerEretzRuntime.js` — Preserves the multiplayer API through visible WebGL startup. The Awtsmoos is One though session and bootstrap reveal distinct measures in rhyme; Awtsmoos.com keeps every caller on one bridge, one transport, and one shared time. Exports: `createMultiplayerEretzRuntime`, `default`, `MultiplayerEretzRuntime`.
- `MultiplayerEretzSession.js` — Owns the sole connection, authority bridge, and status badge for one world. The Awtsmoos joins many windows without dividing the source of their light; Awtsmoos.com keeps one session, one bridge, one transport, in covenant bright. Exports: `MultiplayerEretzRuntime`.
- `RuntimePlayerSnapshot.js` — Converts the local player into network truth without importing remote actors. The Awtsmoos separates one traveler's coordinates from the distant population; Awtsmoos.com can begin a connection without pulling every multiplayer rendering garment into the doorway. Exports: `runtimePlayerSnapshot`, `currentMovementIntent`.
- `AuthoritativeMultiplayerBridge.js` — Bridges runtime truth into local-tab or server-authoritative remote Chassidim. The Awtsmoos gives every distant traveler one present form; Awtsmoos.com imports this population garment only after the connection itself has already succeeded. Exports: `AuthoritativeMultiplayerBridge`, `runtimePlayerSnapshot`.
- `LocalRpgCatalog.js` — Mirrors stable combat, creature, spawn, and adventure definitions offline. The Awtsmoos renews one law through server and local vessels; Awtsmoos.com keeps deterministic single-player rules inspectable and protected by catalog-parity tests. Exports: `LOCAL_RPG_WEAPONS`, `LOCAL_RPG_CREATURES`, `LOCAL_CREATURE_SPAWNS`, `LOCAL_ADVENTURE_IDS`.
- `LocalTabIdentity.js` — Gives every live browser tab one identity without sharing it across duplicated tabs. The Awtsmoos creates every browser vessel separately; Awtsmoos.com therefore keeps the live identity on the Window itself and uses session storage only as a diagnostic breadcrumb. Exports: `localTabPlayerId`, `localTabChannelName`, `localTabPlayerAddress`.
- `LocalTabManagedConnection.js` — Owns localhost tab discovery and exposes an honest managed connection state. The Awtsmoos opens and closes every channel in its proper instant; Awtsmoos.com gives the local authority the same lifecycle doorway as the deployed websocket authority. Exports: `LocalTabManagedConnection`.
- `LocalTabRealtimeClient.js` — Discovers localhost tabs and exchanges exact world-space player snapshots. The Awtsmoos creates each tab and message separately; Awtsmoos.com keeps discovery, ordering, heartbeat, explicit leave, and stale cleanup behind one normalized client. Exports: `LocalTabRealtimeClient`.
- `LocalTabWorldState.js` — Maintains exact world-space tab snapshots with bounded stale-peer cleanup. The Awtsmoos creates every measured position anew; Awtsmoos.com carries actual runtime x/y/z/facing/moving values and never integrates input or invents presentation offsets. Exports: `LOCAL_TAB_STALE_AFTER_MS`, `LocalTabWorldState`.
- `MitzvahWorldBackoff.js` — Computes bounded exponential reconnect delays with optional jitter. The Awtsmoos renews connection without frantic repetition; Awtsmoos.com spaces each attempt through measured patience while preserving a firm maximum delay. Exports: `MitzvahWorldBackoff`.
- `MitzvahWorldChatPanel.js` — Presents live census, scoped history, channels, and private messaging. The Awtsmoos renews each shared word within its rightful boundary; Awtsmoos.com renders text through DOM text nodes and removes every listener when the world closes. Exports: `MitzvahWorldChatPanel`.
- `MitzvahWorldChatPanelStyle.js` — Styles the bounded multiplayer channel, history, census, and private UI. The Awtsmoos renews shared words without covering the world; Awtsmoos.com keeps chat readable, keyboard-visible, collapsible, mobile-aware, and absent offline. Exports: `installMitzvahWorldChatPanelStyle`.

## Exported symbols worth searching

`AuthoritativeMultiplayerBridge` · `runtimePlayerSnapshot` · `LOCAL_RPG_WEAPONS` · `LOCAL_RPG_CREATURES` · `LOCAL_CREATURE_SPAWNS` · `LOCAL_ADVENTURE_IDS` · `localTabPlayerId` · `localTabChannelName` · `localTabPlayerAddress` · `LocalTabManagedConnection` · `LocalTabRealtimeClient` · `LOCAL_TAB_STALE_AFTER_MS` · `LocalTabWorldState` · `MitzvahWorldBackoff` · `MitzvahWorldChatPanel` · `installMitzvahWorldChatPanelStyle`

## Import neighborhood

These import targets were observed in immediate source files and help reveal adjacent ownership:

- `./RemoteChossidPopulation.js`
- `./RuntimePlayerSnapshot.js`
- `./LocalTabRealtimeClient.js`
- `./LocalTabIdentity.js`
- `./LocalTabWorldState.js`
- `./MitzvahWorldChatPanelStyle.js`
- `./LocalRpgCatalog.js`
- `./MitzvahWorldBackoff.js`
- `./MitzvahWorldRealtimeClient.js`
- `./MitzvahWorldSocketOpen.js`
- `./MitzvahWorldCommunityApi.js`
- `./MitzvahWorldEconomyApi.js`

## Directory map

- **Parent:** [`experiments/Awtsmoos/src`](../DIRECTORY_GUIDE.md)
- **Children:** None.

## Related and overlapping systems

- See the [system overlap map](../../../../SYSTEM_OVERLAP_MAP.md) before creating a similarly named subsystem elsewhere.

## Boundaries and cautions

- The directory describes one layer of the system. Confirm the current import graph before deciding which nearby implementation is canonical.
- This guide describes the repository snapshot; it does not declare an implementation canonical when multiple candidates exist.
- Read current imports, callers, tests, and runtime receipts before changing behavior.
- This documentation pass intentionally changes no gameplay or source logic.

## Navigation

- [Project directory index](../../../../DIRECTORY_INDEX.md)
- [System overlap map](../../../../SYSTEM_OVERLAP_MAP.md)

---

*Generated from current directory structure, file types, filenames, leading module descriptions, exports, imports, and tests.*
