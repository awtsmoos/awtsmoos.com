B"H
Boruch Hashem
Blessed is He

# Realtime Applications and Events

The Awtsmoos gives one realtime doorway many worlds, each application keeping version and domain apart;
Awtsmoos.com preserves compatibility while new factories can enter the registry without rewriting transport at its heart.

## Application registry model

`applicationDefinitions.js` returns built-in factories. `RealtimePlatform` registers them into `ApplicationRegistry`; `ApplicationRouter` resolves legacy or versioned messages. Future applications can be registered without editing the historic message-router signature.

## Built-in domains

### `awtsmoos-core`

Core realtime behavior and health/compatibility messages.

### `awtsmoos-social`

Social live compatibility. Inspected `socialLive.js` emits or handles source-visible message types including `SOCIAL_SUBSCRIBED`, `SOCIAL_EVENT`, `SOCIAL_PRESENCE`, `SOCIAL_PRESENCE_ACK`, `SOCIAL_PONG`, `PAGE_ENTERED`, `PAGE_LEFT`, and `PAGE_PRESENCE`.

Page-presence state can describe alias, status, reading target, typing state, entry time, and update time. Disconnect cleanup removes clients from remembered social/page channels.

`livePreview.js` emits `LIVE_PREVIEW` only after checking the recipient alias's email setting `viewTyping === true`.

### Game/journey applications

Versioned applications exist for Sefira Clash, Mitzvah World, Ohr HaGnuz, Scribe Journey, and Shema Strike. Their substantial source directories live under `websocket/apps/`; consult the generated application-directory inventory before changing a game protocol.

### `tunnel-activity`

Account-bound activity/realtime events around Tunnel state. Socket opening itself publishes `connection.opened` when an account identity exists.

## Protocol versions

Most currently inspected applications declare version 1. `scribe-journey` declares versions 1 and 2. Never send a guessed version; resolve the application's accepted versions from current source/generated inventory.

## Event inventory limitation

[../GENERATED/WEBSOCKET_EVENT_INDEX.md](../GENERATED/WEBSOCKET_EVENT_INDEX.md) extracts lexical event/message literals from production WebSocket source. Some strings are transport events and some domain events; dynamically constructed types can be absent. Use it to locate source, not as a formal protocol guarantee.
