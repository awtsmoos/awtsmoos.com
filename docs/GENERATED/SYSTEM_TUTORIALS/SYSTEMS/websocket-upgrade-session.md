B"H
Boruch Hashem
Blessed is He

# System Tutorial: WebSocket Upgrade and Session

**District:** realtime · **System ID:** `websocket-upgrade-session`

Upgrade-time identity/admission, handshake, client-session attachment, and connection activity.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Upgrade source establishes the handshake/session boundary; deployment reachability is not inferred.

## Change risk

Handshake, identity, cookie, and admission changes can alter every realtime application.

## Human manuals

- [docs/WEBSOCKETS/README.md](../../../WEBSOCKETS/README.md)
- [docs/SECURITY/REALTIME_SECURITY.md](../../../SECURITY/REALTIME_SECURITY.md)

## Related project boundaries

- `ayzarim/awtsmoosDynamicServer` (runtime) — ayzarim/awtsmoosDynamicServer

## Source anchors

- `ayzarim/awtsmoosDynamicServer/websocket/core/socketUpgrade.js`

## Generated evidence

- [docs/GENERATED/WEBSOCKET_APPLICATIONS.md](../../WEBSOCKET_APPLICATIONS.md)

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

`websocket` · `upgrade` · `identity` · `protocol`
