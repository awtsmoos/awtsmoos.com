B"H
Boruch Hashem
Blessed is He

# System Tutorial: Realtime Application and Event Evidence

**District:** realtime · **System ID:** `realtime-application-events`

Registered built-in application IDs/versions plus searchable lexical event/message strings from production WebSocket source.

> Generated evidence below is a navigation aid. Trust, migration, consistency, protocol, and authorization semantics remain grounded in the linked human manuals and current source.

## Claims boundary

Event/message literals are search clues only and never constitute a formal payload or protocol schema.

## Change risk

Changing application IDs/versions or event semantics can break clients even when lexical strings still exist.

## Human manuals

- [docs/WEBSOCKETS/APPLICATIONS.md](../../../WEBSOCKETS/APPLICATIONS.md)
- [docs/WEBSOCKETS/README.md](../../../WEBSOCKETS/README.md)

## Related project boundaries

- `ayzarim/awtsmoosDynamicServer` (runtime) — ayzarim/awtsmoosDynamicServer

## Source anchors

- `ayzarim/awtsmoosDynamicServer/websocket/apps/applicationDefinitions.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/messageRouter.js`

## Generated evidence

- [docs/GENERATED/WEBSOCKET_APPLICATIONS.md](../../WEBSOCKET_APPLICATIONS.md)
- [docs/GENERATED/WEBSOCKET_EVENT_INDEX.md](../../WEBSOCKET_EVENT_INDEX.md)

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

- `ACK` — `ayzarim/awtsmoosDynamicServer/websocket/apps/aliasRouting.js`
- `audio` — `ayzarim/awtsmoosDynamicServer/websocket/apps/privateMessaging/messageAttachmentPolicy.js`
- `awtsmoosMyDevice` — `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/envelopeErrors.js`
- `bossTelegraph` — `ayzarim/awtsmoosDynamicServer/websocket/apps/sefiraClash/CoopCombat.js`
- `bridge:lanterns` — `ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/RiverCrossingService.js`
- `care` — `ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/CombatActionRequest.js`
- `chat` — `ayzarim/awtsmoosDynamicServer/websocket/apps/privateMessaging/integrationGateway.js`
- `chat-accepted` — `ayzarim/awtsmoosDynamicServer/websocket/apps/privateMessaging/meaningfulActivity.js`
- `chess.chat.sent` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/socialHandlers.js`
- `chess.click.accepted` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/onlineGameHandlers.js`
- `chess.event.accepted` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/broadcastGameHandlers.js`
- `chess.game.finished.accepted` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/onlineGameHandlers.js`
- `chess.history.activity.accepted` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/historyHandlers.js`
- `chess.history.listed` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/historyHandlers.js`
- `chess.history.started` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/historyHandlers.js`
- `chess.media.signal.accepted` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/socialHandlers.js`
- `chess.media.state.accepted` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/socialHandlers.js`
- `chess.room.created` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/roomHandlers.js`
- `chess.room.joined` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/roomHandlers.js`
- `chess.room.listed` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/roomHandlers.js`
- `chess.room.watched` — `ayzarim/awtsmoosDynamicServer/websocket/apps/chess/roomHandlers.js`
- `code.access.invited` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/accessHandlers.js`
- `code.access.updated` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/accessHandlers.js`
- `code.file.patched` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/editHandlers.js`
- `code.file.synced` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/editHandlers.js`
- `code.presence.updated` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/presenceHandlers.js`
- `code.project.created` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/lifecycleHandlers.js`
- `code.project.joined` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/lifecycleHandlers.js`
- `code.project.left` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/lifecycleHandlers.js`
- `code.project.structured` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyCode/structureEvents.js`
- `contact-blocked` — `ayzarim/awtsmoosDynamicServer/websocket/apps/privateMessaging/meaningfulActivity.js`
- `data` — `ayzarim/awtsmoosDynamicServer/websocket/apps/scribeJourney/rawWebSocketTestClient.cjs`
- `defeat` — `ayzarim/awtsmoosDynamicServer/websocket/apps/mitzvahWorld/CombatDefeatRewards.js`
- `docs.access.invited` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyDocs/accessHandlers.js`
- `docs.access.updated` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyDocs/accessHandlers.js`
- `docs.capabilities` — `ayzarim/awtsmoosDynamicServer/websocket/apps/geelooyDocs/capabilityHandlers.js`

## Tags

`websocket` · `application` · `event` · `evidence`
