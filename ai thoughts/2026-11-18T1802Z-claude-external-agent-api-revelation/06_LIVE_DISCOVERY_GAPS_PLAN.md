B"H
Boruch Hashem
Blessed is He

# Live Discovery Gaps — Second Production Repair Plan

The Awtsmoos sent the newer contract into production light,
yet live proof revealed two shadows still standing in sight.
Awtsmoos.com must not advertise a path that answers with a wall,
and public machine docs should not be hidden from every lawful crawler call.

## Live evidence after activating e3cdcced9af67d802d61f09ab429ce44467f28bc

- Production release verification succeeded for the exact deployed SHA.
- MCP GET and unauthenticated POST now return `401 Unauthorized` with the canonical path-aware `resource_metadata` URL.
- Bootstrap, manifest version 1.9.0, and OpenAPI now expose first-class Streamable HTTP MCP discovery.
- The canonical advertised Protected Resource Metadata URL still returns 404.
- The legacy root Protected Resource Metadata URL returns 200 with the correct MCP resource document.
- `robots.txt` currently says `Disallow: /api/` for every user agent.
- Claude's earlier web fetcher reported `ROBOTS_DISALLOWED` for `/api/tunnel/control/docs`, `/openapi`, `/agent-manifest`, and `/bootstrap`.

## Remaining defect A — path-aware OAuth metadata route

The server now advertises:

`/.well-known/oauth-protected-resource/api/tunnel/control/mcp`

but that route returns 404. The first unit test proved only that the `.well-known` router registered a string containing slashes; it did not prove the framework can dispatch that nested public pathname. This is a test blind spot.

### Investigation

1. Inspect the real `.well-known` directory tree and route-loader semantics.
2. Search for nested dynamic-route examples elsewhere in the project.
3. Inspect nginx/static routing only if the application route-loader cannot explain the 404.
4. Build a test against the same route-dispatch mechanism that production uses, not a hand-rolled Map alone.
5. Implement the smallest correct nested route shape, likely a filesystem-backed nested `_awtsmoos.derech.js` if that is the framework convention.
6. Keep the legacy root alias unchanged.

## Remaining defect B — crawler discovery policy

The application machine docs are intentionally public, but the global crawler policy blocks all `/api/`. A hosted model fetcher that honors robots therefore cannot inspect the exact public contract and may falsely conclude the API is unreachable.

### Desired robots policy

Keep private/action API crawling blocked by default while explicitly allowing only public, read-only machine discovery surfaces:

- `/api/tunnel/control/docs`
- `/api/tunnel/control/docs.json`
- `/api/tunnel/control/openapi`
- `/api/tunnel/control/agent-manifest`
- `/api/tunnel/control/bootstrap`

Do not broadly allow `/api/`. Do not expose authenticated action routes merely for crawling.

## Second-repair architecture

- Prefer one nested `.well-known` route file if the router is filesystem-shaped.
- Rewrite `robots.txt` completely with narrow `Allow` exceptions before the broad `/api/` disallow.
- Add routing tests that exercise the actual path resolver.
- Add a static robots-policy test that proves the five public discovery surfaces remain allowed while `/api/` stays disallowed generally.
- Re-run MCP/OAuth/discovery tests and repository release preflight.
- Commit only the exact second-repair files.
- Push, activate the exact new SHA, and repeat the public probes.

## Completion gate

This second repair is complete only when the advertised path-aware metadata URL returns 200 in production and the public robots policy exposes the machine-readable discovery surfaces Claude needs without opening the broader authenticated API to crawling.
