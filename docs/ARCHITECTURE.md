B"H
Boruch Hashem
Blessed is He

# Architecture

The Awtsmoos sends one request through many vessels, yet the source remains One;
Awtsmoos.com reveals browser, file, derech, database, identity, socket, and provider paths until the work is done.

## HTTP request flow

1. Root `index.js` creates HTTP infrastructure and an `AwtsServer` from `ayzarim/awtsmoosDynamicServer`.
2. Mitzvah World direct report/ping handlers are checked before generic dispatch.
3. Other HTTP requests enter `dynamicServer.onRequest`.
4. `AwtsmoosStaticServer.mainDir` defaults to `config.public || "geelooy"`, making `geelooy/` the default public root.
5. Request bootstrap parses URL/cookies/body/context and computes a physical public path.
6. Dynamic discovery walks upward for `_awtsmoos.derech.js`.
7. Exact, `:name`, and terminal `:name*` route patterns are matched.
8. Ordinary public files/directories remain part of serving behavior when dynamic handlers do not own the response.

## Major layers

### Root process

`index.js` coordinates HTTP, WebSocket upgrade delegation, SMTP startup, direct Mitzvah World routes, and dynamic-server dispatch.

### Public filesystem — `geelooy/`

Pages, apps, games, shared browser code, scripts/styles, and the filesystem-located API tree live here.

### Dynamic server — `ayzarim/awtsmoosDynamicServer/`

Owns request bootstrap, static/dynamic routing, auth installation, DosDB initialization, body readers, compact-JS support, response behavior, WebSockets, and runtime utilities.

### HTTP API mounts

There are 21 `_awtsmoos.derech.js` files under `geelooy/api`. Some return literal route maps; others delegate route tables and handler modules. [GENERATED/API_ROUTE_CONTRACT_ATLAS.md](GENERATED/API_ROUTE_CONTRACT_ATLAS.md) joins every discovered path to the best file-level contract evidence without inventing missing methods.

### Realtime platform

WebSocket upgrade and message routing live under `ayzarim/awtsmoosDynamicServer/websocket/`. The server owns one `RealtimePlatform` with an application registry/router and eight built-in versioned applications. Mission Rooms add one-time ticket/origin/current-authority/protocol checks before handshake. Tunnel Relay is a separate account-bound transport subsystem. Read [WEBSOCKETS/README.md](WEBSOCKETS/README.md).

### Persistence — DosDB

`server/initDb.js` resolves the database root from environment/local config/tracked config/fallback, publishes `process.awtsmoosDbPath`, initializes `DosDB`, and shares it with runtime systems. See [SYSTEMS/DATABASE_AND_STORAGE.md](SYSTEMS/DATABASE_AND_STORAGE.md).

### Identity and authority

Server auth supplies trusted identity. Social also supports revocable API keys. Tunnel Control can resolve OAuth/API-key/session identity and rejects browser-submitted owner fields as authority. WebSocket `ApplicationRouter` likewise derives trusted identity from `client.identity`, not message payload.

### External integrations

PayPal, YouTube/Google, OAuth, SMTP/email, SSH, AI/model systems, and streaming connectors introduce provider-specific credentials/configuration and failure modes. See [INTEGRATIONS.md](INTEGRATIONS.md) and [CONFIGURATION.md](CONFIGURATION.md).

## Route grammar

- exact: `/api/gpt/health`;
- dynamic segment: `/api/sefarim/:sefer`;
- multiple dynamics: `/api/ssh/connect/:username/:host`;
- terminal catch-all: `:name*`;
- `$i`, `$_GET`, `$_POST`, `$_DELETE`: request/context vessels, not URL syntax.

## Current evidence volume

The generator reports 1,195 API sources, 567 route rows, 327 dynamic rows, 306 source-contract rows, 567 route-contract rows, 337 caller rows, 61 environment names, 33 test scripts, 8 realtime applications, and 53 WebSocket event/message evidence rows.
