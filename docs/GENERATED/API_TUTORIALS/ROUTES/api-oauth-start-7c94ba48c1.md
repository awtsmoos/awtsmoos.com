B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/oauth/start

**Family:** OAuth · **Mount:** `/api/oauth` · **Derech health:** OK

**Source:** `geelooy/api/oauth/routes/table.js` · **Discovery:** route-table · **Confidence:** unknown-method

[Read the human OAuth tutorial](../../../TUTORIALS/API/OAUTH.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: **unknown**
- Request vessels: —
- Observed status literals: —
- Observed headers: —

## Path parameters

None.

## Starter call

No executable starter is generated because method evidence is unknown. Inspect the source handler before choosing a method or payload.

## Observed callers

Pattern-compatible evidence only; it does not prove runtime dispatch.

| Literal | Source | Kind |
| --- | --- | --- |
| `/api/oauth/start?client_id=chatgpt` | `geelooy/apps/tunnel-control/js/api/auth.js` | runtime |
| `/api/oauth/start?next=${next}` | `geelooy/apps/code/js/session/inline-login.js` | runtime |

## Related tests

No package-script heuristic match was found.

## Related routes

- [`/api/oauth/:route`](./api-oauth-route-99d253c847.md)
- [`/api/oauth/agent-callback`](./api-oauth-agent-callback-b4e6bf1061.md)
- [`/api/oauth/authorize`](./api-oauth-authorize-bdf605a5c6.md)
- [`/api/oauth/device`](./api-oauth-device-ff7c9e5d87.md)
- [`/api/oauth/device-authorization`](./api-oauth-device-authorization-c8c90e0df0.md)
- [`/api/oauth/metadata`](./api-oauth-metadata-323cb59001.md)
- [`/api/oauth/token`](./api-oauth-token-037d29e842.md)
