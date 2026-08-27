B"H
Boruch Hashem
Blessed is He

# Repository 101

## What you will learn

Where public products, APIs, runtime infrastructure, persistence, automation, tests, and documentation live.

## Mental model

`geelooy/` is the default public root. `ayzarim/` holds server/runtime infrastructure. Root `index.js` boots HTTP, WebSocket, SMTP, and direct Mitzvah World handlers. Support roots such as `scripts/`, `tools/`, `tests/`, `ops/`, and `templates/` surround product code.

## Walk it in this order

1. Read `docs/ARCHITECTURE.md`.
2. Use `docs/GENERATED/PROJECT_ATLAS.md` to locate project boundaries.
3. Open the nearest local `DOCUMENTATION.md`.
4. Use `/docs/` for search and deep links.
5. Inspect source/tests before changing behavior.

## Important distinctions

- Directory size does not prove product ownership.
- Root aliases/symlinks are not duplicate implementations.
- `geelooy/api/` is filesystem source; HTTP behavior depends on ancestor derech discovery.
- Generated evidence is intentionally volatile and regenerated.

## Verify it yourself

```sh
node scripts/docs/generate-docs.js
node scripts/docs/validate-docs.js
```

## Next

[Server Lifecycle 101](SERVER_LIFECYCLE_101.md) then [HTTP Routing 101](HTTP_ROUTING_101.md).
