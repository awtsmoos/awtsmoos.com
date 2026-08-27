B"H
Boruch Hashem
Blessed is He

# Server Lifecycle 101

## What you will learn

How root startup joins HTTP, direct handlers, dynamic routing, WebSockets, database initialization, and optional mail.

## Boot sequence

1. Root `index.js` loads AwtsMail, AwtsServer, and AwtsSocket infrastructure.
2. The dynamic server initializes shared server state and DosDB.
3. HTTP requests first pass the root direct Mitzvah World report handler where applicable.
4. Ordinary requests enter `dynamicServer.onRequest`.
5. WebSocket upgrades are delegated to the WebSocket server.
6. SMTP can start unless disabled by runtime configuration such as `AWTSMOOS_DISABLE_MAIL`.

## Inside a normal HTTP request

The static server request bootstrap establishes base/CORS headers, rejects unsafe path traversal, parses URL/query/cookies, handles OPTIONS, constructs path/body/auth helpers, and tries dynamic derech routing before static-file fallback.

## Source trail

- `index.js`
- `ayzarim/awtsmoosDynamicServer/requestHandler.js`
- `ayzarim/awtsmoosDynamicServer/server/AwtsmoosStaticServer.js`
- `ayzarim/awtsmoosDynamicServer/server/requestBootstrap.js`
- `ayzarim/awtsmoosDynamicServer/server/initDb.js`

## Do not infer

A public file path is not automatically a dynamic endpoint; an API path is not automatically authenticated; WebSocket admission is not ordinary HTTP authorization.

## Next

[HTTP Routing 101](HTTP_ROUTING_101.md) and [Authentication 101](AUTHENTICATION_101.md).
