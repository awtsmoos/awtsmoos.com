B"H
Boruch Hashem
Blessed is He

# Phase One — Theoretical File Map

The Awtsmoos reveals architecture as vessels within vessels; Awtsmoos.com requires each vessel to stay small, named, and independently testable.

## Files to inspect before deciding

- `index.html`
- `src/launcher/MinimalSharedMeadowPage.js`
- `src/launcher/MitzvahWorldSessionMode.js`
- `src/launcher/MitzvahWorldLauncher.js`
- `src/launcher/MitzvahWorldDirectRoute.js`
- `src/launcher/MitzvahWorldModeLoaders.js`
- `src/launcher/bootMitzvahWorldPage.js`
- `src/network/MultiplayerEretzBootstrap.js`
- `src/network/MultiplayerEretzSession.js`
- `src/network/MultiplayerConnectionFactory.js`
- `src/network/LocalTabManagedConnection.js`
- `src/network/MitzvahWorldManagedConnection.js`
- `src/network/AuthoritativeMultiplayerBridge.js`
- `src/network/RemoteChossidPopulation.js`
- all session, transport, bridge, reconnect, local-tab, route, and browser tests
- server application/session/protocol/persistence/security files

## Possible new source modules

- `src/launcher/MinimalMeadowSessionBootstrap.js` — canonical entry orchestration.
- `src/network/MultiplayerConnectionStatus.js` — stable UI projection.
- `src/ui/MinimalMeadowMultiplayerStatus.js` — status badge and peer count.
- `src/network/MultiplayerWorldAuthority.js` — consequence-domain boundary.
- `src/network/MultiplayerQuestAuthority.js` — personal/party/world quest envelope.
- `src/network/MultiplayerLootAuthority.js` — corpse-claim and receipt envelope.
- `src/performance/MinimalMeadowBootMetrics.js` — first-control and feature timing.
- `src/app/MinimalMeadowCriticalFeatureBundle.js` — essential quest/combat layer.
- `src/app/MinimalMeadowRichFeatureBundle.js` — deferred optional richness.

## Possible new tests

- `src/test/MinimalSharedMeadowSessionDefault.test.mjs`
- `src/test/network/multiplayerConnectionLifecycle.test.mjs`
- `src/test/network/multiplayerWorldIsolation.test.mjs`
- `src/test/network/multiplayerQuestAuthority.test.mjs`
- `src/test/network/multiplayerLootAuthority.test.mjs`
- `src/test/browser/defaultMultiplayerTwoClient.test.mjs`
- `src/test/browser/defaultSingleplayer.test.mjs`
- `src/test/browser/multiplayerOfflineFallback.test.mjs`
- `src/test/browser/multiplayerReconnect.test.mjs`
- `src/test/browser/multiplayerServerAcceptance.test.mjs`
- `src/test/performance/minimalMeadowBootBudget.test.mjs`

## Existing files likely to rewrite completely

- `index.html`
- `MinimalSharedMeadowPage.js`
- one launcher/session resolver if duplication exists
- the failing multiplayer helper test
- connection lifecycle owner if state semantics are ambiguous
- feature bundle owner if split is safe
- optional-entry imports if eager

## Files not to touch until authority design is proven

- combat transaction internals
- inventory reward internals
- corpse transaction internals
- quest completion exact-once code
- server persistence schemas
- broad world geometry

## File-size law

Every new or rewritten code file must remain at or below 120 lines. Large responsibilities must split into submodules. No compressed one-line functions. Tabs for indentation. Complete-file writes only.
