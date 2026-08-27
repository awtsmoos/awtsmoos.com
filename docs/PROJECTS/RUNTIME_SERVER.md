B"H
Boruch Hashem
Blessed is He

# Awtsmoos Dynamic Server

The Awtsmoos lets Awtsmoos.com become a running world through HTTP, filesystem serving, derech routing, authentication, DosDB, WebSocket upgrades, realtime applications and server utilities.

## Canonical source

`ayzarim/awtsmoosDynamicServer/`

The root process imports the server from this runtime layer. `AwtsmoosStaticServer` uses `geelooy` as the default public root unless configuration supplies another public directory.

## Main responsibilities

- HTTP request bootstrap and parsing.
- Static/public filesystem serving.
- Upward discovery of `_awtsmoos.derech.js` dynamic route modules.
- Exact and parameterized route matching.
- Authentication installation for HTTP and sockets.
- DosDB initialization and runtime sharing.
- WebSocket upgrade/session handling.
- Versioned realtime application registry/router.
- Mission Room and Tunnel-related realtime subsystems.
- Runtime/body/compact-JS/server utilities.

## Entry docs

- `docs/ARCHITECTURE.md` — whole request/runtime architecture.
- `docs/ROUTES/DYNAMIC_PATHS.md` — derech discovery and `:name` grammar.
- `docs/WEBSOCKETS/README.md` — realtime platform.
- `docs/DATA/README.md` — persistence startup and storage layers.
- `docs/SECURITY/README.md` — auth and trust boundaries.

## Generated evidence

The generated project atlas and symbol summary expose the size/symbol surface of the runtime. `PROJECT_DEPENDENCIES.md` shows lexical cross-project imports, including the server's relationships with APIs and DosDB. This is discovery evidence, not a runtime call graph.

## High-risk change areas

Changes to request path resolution, derech discovery, auth installation, DB initialization, WebSocket upgrade policy or shared response behavior can affect many otherwise unrelated applications. Treat them as platform changes: search dependents, run dynamic-server tests, representative API tests, socket tests and browser smoke checks.

## Local breadcrumb

`ayzarim/awtsmoosDynamicServer/DOCUMENTATION.md` should remain the in-tree entry point and link back to the central manuals rather than duplicate this entire chapter.
