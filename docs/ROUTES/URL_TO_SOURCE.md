B"H
Boruch Hashem
Blessed is He

# URL to Source

The Awtsmoos lets the visible address point back toward the hidden file;
Awtsmoos.com gives this lookup so a maintainer can cross the distance in a little while.

## General rule

The server's default public root is `geelooy`. For a non-API URL, begin by joining the URL path beneath `geelooy/`. Then inspect `index.html`, scripts, nested files, and any ancestor `_awtsmoos.derech.js`.

| URL | First source location | Additional system |
| --- | --- | --- |
| `/os` | `geelooy/os/` | `geelooy/shared/virtual-os`, platform modules |
| `/apps/code` | `geelooy/apps/code/` | compiler/runtime/tunnel APIs as used |
| `/apps/tunnel-control` | `geelooy/apps/tunnel-control/` | `/api/tunnel/control/*`, shared tunnel |
| `/apps/tunnel` | `geelooy/apps/tunnel/` | `/api/tunnel/*` |
| `/apps/wallet` | `geelooy/apps/wallet/` | `/api/wallet/*` |
| `/youtube` | `geelooy/youtube/` | `/api/youtube/*` |
| `/profile` | `geelooy/profile/` | `/api/social/*` |
| `/heichelos/...` | `geelooy/heichelos/` | `/api/social/*` |
| `/social-hub` | `geelooy/social-hub/` | `/api/social/*` |
| `/games/...` | `geelooy/games/...` | possible WebSocket server apps |
| `/db` | `geelooy/db/` | DosDB runtime |
| `/ai` | `geelooy/ai/` | `/api/gpt/*` |

## API URL lookup

Search [../GENERATED/API_ROUTE_ATLAS.md](../GENERATED/API_ROUTE_ATLAS.md). Each row includes the URL pattern, source file, and discovery method.

Examples:

- `/api/gpt/health` → GPT derech.
- `/api/wallet/balance` → Wallet route table.
- `/api/tunnel/control/my-device` → Tunnel Control route table.
- `/api/tunnel/install/windows` → Tunnel installer derech.
- `/api/ssh/connect/:username/:host` → SSH derech.

## Root-direct exception

`/mitzvahWorld/autoplay-ping`, `/mitzvahWorld/autoplay-report`, and `/api/mitzvahWorld/autoplay-report` are handled directly in root `index.js` before generic dynamic-server dispatch. See [../API/DIRECT_ROOT_HANDLERS.md](../API/DIRECT_ROOT_HANDLERS.md).

## WebSocket exception

A URL or ticket flow that upgrades to WebSocket may continue in `ayzarim/awtsmoosDynamicServer/websocket/` rather than an ordinary derech response. Mission rooms and some game systems are examples of this second runtime plane.
