B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/tunnel/request/:tunnelName

**Family:** Tunnel Relay · **Mount:** `/api/tunnel` · **Derech health:** OK

**Source:** `geelooy/api/tunnel/_awtsmoos.derech.js` · **Discovery:** static-literal · **Confidence:** unknown-method

[Read the human Tunnel Relay tutorial](../../../TUTORIALS/API/TUNNEL.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: **unknown**
- Request vessels: `route-vars`, `headers`, `identity`
- Observed status literals: `401`, `404`
- Observed headers: `Access-Control-Allow-Origin`, `Content-Type`

## Path parameters

| Name | Shape |
| --- | --- |
| `tunnelName` | single segment |

## Starter call

No executable starter is generated because method evidence is unknown. Inspect the source handler before choosing a method or payload.

## Observed callers

No matching literal caller evidence was found.

## Related tests

Heuristic family matches:

- `test:mission-continuity-actions` — `node geelooy/apps/tunnel/agent/tools/fs/actionGroups/test/missionContinuityActions.test.mjs`
- `test:treasury` — `node geelooy/api/tunnel/control/test/runTreasuryTests.cjs`
- `test:treasury:full` — `node geelooy/api/tunnel/control/test/treasury/runAll.cjs`
- `test:tunnel-release` — `node --test scripts/tunnel/testing/*.test.cjs scripts/repository-hygiene/testing/*.test.cjs`

## Related routes

- [`/api/tunnel/fs/:tunnelName`](./api-tunnel-fs-tunnelname-48e2aaea39.md)
