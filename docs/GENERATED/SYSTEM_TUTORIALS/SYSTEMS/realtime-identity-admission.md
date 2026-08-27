B"H
Boruch Hashem
Blessed is He

# System Tutorial: Realtime Identity and Admission

**District:** security · **System ID:** `realtime-identity-admission`

Trusted WebSocket identity, origin/protocol/ticket checks, and Mission Room authority before realtime participation.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Admission combines multiple checks; a successful HTTP identity alone does not prove room authority.

## Change risk

Weakening ticket/origin/protocol/authority checks can cross a realtime security boundary.

## Human manuals

- [docs/SECURITY/REALTIME_SECURITY.md](../../../SECURITY/REALTIME_SECURITY.md)
- [docs/WEBSOCKETS/MISSION_ROOMS.md](../../../WEBSOCKETS/MISSION_ROOMS.md)

## Related project boundaries

- `ayzarim/awtsmoosDynamicServer` (runtime) — ayzarim/awtsmoosDynamicServer
- `geelooy/api/tunnel` (api) — geelooy/api/tunnel

## Source anchors

- `ayzarim/awtsmoosDynamicServer/websocket/core/socketUpgrade.js`
- `geelooy/api/tunnel/control/missionRooms/ticketIssuer.js`
- `geelooy/api/tunnel/control/missionRooms/missionAccess.js`

## Generated evidence

- [docs/GENERATED/WEBSOCKET_EVENT_INDEX.md](../../WEBSOCKET_EVENT_INDEX.md)

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTSMOOS_WS_MAX_MISSED_HEARTBEATS` | runtime-config | 1 | `ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js` |
| `AWTSMOOS_WS_PROBE_GRACE_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js` |
| `AWTSMOOS_WS_STALE_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/core/clientLiveness.js` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

None observed for this system packet.

## Tags

`identity` · `authorization` · `origin` · `protocol` · `websocket`
