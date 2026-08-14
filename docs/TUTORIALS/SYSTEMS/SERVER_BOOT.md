B"H
Boruch Hashem
Blessed is He

# Tutorial: Server Boot

Root `index.js` is the orchestration point. It initializes the dynamic server, routes ordinary HTTP, owns direct Mitzvah World report paths, delegates WebSocket upgrades, and can start SMTP.

## Follow the boot

1. Read `index.js` imports for AwtsMail/AwtsServer/AwtsSocket.
2. Follow dynamic-server initialization.
3. Inspect `server/initDb.js` for shared DosDB setup.
4. Inspect request bootstrap/auth setup.
5. Inspect WebSocket registry/application definitions separately.
6. Inspect mail-disable configuration before assuming SMTP is live.

## Boundaries

Root direct handlers are exceptions, not the normal API convention. Most dynamic HTTP behavior belongs to derech discovery. WebSocket admission is separate from HTTP routing.

## Evidence

Read `docs/LEARN/SERVER_LIFECYCLE_101.md`, `docs/ARCHITECTURE.md`, and generated public/route inventories.
