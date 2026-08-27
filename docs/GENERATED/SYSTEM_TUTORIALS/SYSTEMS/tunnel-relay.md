B"H
Boruch Hashem
Blessed is He

# System Tutorial: Tunnel Relay

**District:** realtime · **System ID:** `tunnel-relay`

Account-bound agent/device transport, durable request correlation, registration authority, and relay lifecycle.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Tunnel Relay is a specialized account-bound transport, not one of the ordinary versioned application factories.

## Change risk

Registration authority, routing identity, correlation, retry, or durable-state changes can cross account/transport boundaries.

## Human manuals

- [docs/WEBSOCKETS/TUNNEL_RELAY.md](../../../WEBSOCKETS/TUNNEL_RELAY.md)
- [docs/TUTORIALS/API/TUNNEL_CONTROL.md](../../../TUTORIALS/API/TUNNEL_CONTROL.md)

## Related project boundaries

- `ayzarim/awtsmoosDynamicServer` (runtime) — ayzarim/awtsmoosDynamicServer
- `geelooy/api/tunnel` (api) — geelooy/api/tunnel

## Source anchors

- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/securityBridge.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/registrationAuthority.js`

## Generated evidence

- [docs/GENERATED/WEBSOCKET_EVENT_INDEX.md](../../WEBSOCKET_EVENT_INDEX.md)

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTSMOOS_REGISTRATION_STRESS_COUNT` | test/tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/test/registrationReplacementStress.test.cjs` |
| `AWTSMOOS_RELAY_STRESS_COUNT` | test/tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.concurrent-correlation.test.cjs` |
| `AWTSMOOS_SEFIRA_PROFILE_PATH` | path/storage | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/sefiraClash/ExpeditionProfileRepository.js` |
| `AWTSMOOS_TUNNEL_COMPLETED_LIMIT` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_CONSUMER_PROGRESS_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/requestAckHandler.js` |
| `AWTSMOOS_TUNNEL_CONTROL_STORE` | path/storage | 9 | `ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/missionRoomSocketIntegration.test.cjs; ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/missionRoomUpgrade.test.cjs; ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/upgradePolicy.test.cjs` |
| `AWTSMOOS_TUNNEL_PENDING_TTL_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_QUARANTINE_LIMIT` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_RELAY_MAX_SAFE_WAIT_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_RELAY_SAFE_WAIT_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_RELAY_STATE_ROOT` | path/storage | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/durablePaths.js` |
| `AWTSMOOS_TUNNEL_REQUEST_ACCEPTANCE_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/requestDispatch.js` |
| `MW_LOAD_CLIENTS` | runtime-config | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/sessionLoadProbe.cjs` |

## Realtime application registration evidence

No versioned application registrations are attached to this packet.

## Lexical event/message evidence

- `awtsmoosMyDevice` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeErrors.js`
- `retryAction` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/canonicalEnvelopes.js`
- `retryAction` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeIdentity.js`
- `TUNNEL_ACK` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/register.js`
- `TUNNEL_ACK` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/registrationTransfer.js`
- `TUNNEL_REPLACED` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/registrationTransfer.js`
- `TUNNEL_REQUEST` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/requestDispatch.js`
- `TUNNEL_RESPONSE_ACK` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/responseHandler.js`
- `tunnelRequestConflict` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeErrors.js`
- `tunnelRequestPending` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopePending.js`
- `tunnelRequestPersistenceFailed` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/canonicalEnvelopes.js`
- `tunnelRequestSendFailed` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeErrors.js`
- `tunnelRequestStateUnknown` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeErrors.js`
- `tunnelRequestTransportStalled` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeErrors.js`
- `tunnelUnavailable` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeErrors.js`

## Tags

`websocket` · `tunnel` · `relay` · `authorization` · `correlation`
