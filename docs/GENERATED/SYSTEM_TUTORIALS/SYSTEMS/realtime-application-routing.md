B"H
Boruch Hashem
Blessed is He

# System Tutorial: Realtime Application Routing

**District:** realtime · **System ID:** `realtime-application-routing`

The platform registry/router that selects versioned realtime applications and shares server state.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Registered application factories are source registration evidence, not proof that every app is active in every deployment.

## Change risk

Application IDs, versions, registry selection, or legacy compatibility changes are protocol contracts.

## Human manuals

- [docs/WEBSOCKETS/APPLICATIONS.md](../../../WEBSOCKETS/APPLICATIONS.md)
- [docs/TUTORIALS/SYSTEMS/REALTIME_RUNTIME.md](../../../TUTORIALS/SYSTEMS/REALTIME_RUNTIME.md)

## Related project boundaries

- `ayzarim/awtsmoosDynamicServer` (runtime) — ayzarim/awtsmoosDynamicServer

## Source anchors

- `ayzarim/awtsmoosDynamicServer/websocket/apps/messageRouter.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/applicationDefinitions.js`

## Generated evidence

- [docs/GENERATED/WEBSOCKET_APPLICATIONS.md](../../WEBSOCKET_APPLICATIONS.md)

## Environment-name evidence

| Name | Class | Source refs | Example sources |
| --- | --- | --- | --- |
| `AWTSMOOS_REGISTRATION_STRESS_COUNT` | test/tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/test/registrationReplacementStress.test.cjs` |
| `AWTSMOOS_RELAY_STRESS_COUNT` | test/tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.concurrent-correlation.test.cjs` |
| `AWTSMOOS_SEFIRA_PROFILE_PATH` | path/storage | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/sefiraClash/ExpeditionProfileRepository.js` |
| `AWTSMOOS_TUNNEL_COMPLETED_LIMIT` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_CONSUMER_PROGRESS_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/requestConsumerWatchdog.js` |
| `AWTSMOOS_TUNNEL_CONTROL_STORE` | path/storage | 9 | `ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/missionRoomSocketIntegration.test.cjs; ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/missionRoomUpgrade.test.cjs; ayzarim/awtsmoosDynamicServer/websocket/apps/missionRooms/upgradePolicy.test.cjs` |
| `AWTSMOOS_TUNNEL_PENDING_TTL_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_QUARANTINE_LIMIT` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_RELAY_MAX_SAFE_WAIT_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_RELAY_SAFE_WAIT_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js` |
| `AWTSMOOS_TUNNEL_RELAY_STATE_ROOT` | path/storage | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/durablePaths.js` |
| `AWTSMOOS_TUNNEL_REQUEST_ACCEPTANCE_MS` | tuning | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/requestDispatchWatchdog.js` |
| `MW_LOAD_CLIENTS` | runtime-config | 1 | `ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/sessionLoadProbe.cjs` |

## Realtime application registration evidence

| Application | Versions | Factory |
| --- | --- | --- |
| `awtsmoos-core` | 1 | `createAwtsmoosCoreApplication` |
| `awtsmoos-social` | 1 | `createAwtsmoosSocialApplication` |
| `chess` | 1 | `createChessApplication` |
| `geelooy-code` | 1 | `createGeelooyCodeApplication` |
| `geelooy-docs` | 1 | `createGeelooyDocsApplication` |
| `sheets` | 1 | `createSheetsApplication` |
| `universal-chat` | 1 | `createUniversalChatApplication` |
| `private-messaging` | 1 | `createPrivateMessagingApplication` |
| `sefira-clash` | 1 | `createSefiraClashApplication` |
| `mitzvah-world` | 1 | `createMitzvahWorldApplication` |
| `ohr-hagnuz` | 1 | `createOhrHagnuzApplication` |
| `scribe-journey` | 1, 2 | `createScribeJourneyApplication` |
| `tunnel-activity` | 1 | `createTunnelActivityApplication` |
| `shema-strike` | 1 | `createShemaStrikeApplication` |

## Lexical event/message evidence

None observed for this system packet.

## Tags

`websocket` · `application` · `router` · `versioning`
