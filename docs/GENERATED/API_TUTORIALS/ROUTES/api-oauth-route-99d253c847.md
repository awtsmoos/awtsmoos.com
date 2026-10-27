B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/oauth/:route

**Family:** OAuth · **Mount:** `/api/oauth` · **Derech health:** OK

**Source:** `geelooy/api/oauth/_awtsmoos.derech.js` · **Discovery:** static-literal · **Confidence:** unknown-method

[Read the human OAuth tutorial](../../../TUTORIALS/API/OAUTH.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: **unknown**
- Request vessels: `route-vars`
- Observed status literals: `404`
- Observed headers: `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Origin`, `Cache-Control`

## Path parameters

| Name | Shape |
| --- | --- |
| `route` | single segment |

## Starter call

No executable starter is generated because method evidence is unknown. Inspect the source handler before choosing a method or payload.

## Observed callers

Pattern-compatible evidence only; it does not prove runtime dispatch.

| Literal | Source | Kind |
| --- | --- | --- |
| `/api/oauth/authorize?client=social-hub` | `geelooy/social-hub/tests/legalEntry.test.mjs` | test |
| `/api/oauth/device` | `geelooy/apps/tunnel-control/index.html` | runtime |
| `/api/oauth/device` | `geelooy/apps/tunnel-control/js/shell/agentLinks.js` | runtime |
| `/api/oauth/device-authorization` | `geelooy/apps/tunnel/test/externalAiInstructions.test.cjs` | test |
| `/api/oauth/metadata` | `geelooy/scripts/shliach/ConnectionMetadata.js` | runtime |
| `/api/oauth/start?client_id=chatgpt` | `geelooy/apps/tunnel-control/js/api/auth.js` | runtime |

## Related tests

No package-script heuristic match was found.

## Related routes

- [`/api/oauth/getRouteHandler`](./api-oauth-getroutehandler-487575ef09.md)
- [`/api/oauth/getRouteTable`](./api-oauth-getroutetable-632912a20b.md)
- [`/api/oauth/listRouteNames`](./api-oauth-listroutenames-9be1b1f0f5.md)
