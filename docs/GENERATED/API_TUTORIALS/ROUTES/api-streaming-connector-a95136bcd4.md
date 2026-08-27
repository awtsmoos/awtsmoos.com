B"H
Boruch Hashem
Blessed is He

# API Tutorial: /api/streaming/:connector

**Family:** Streaming · **Mount:** `/api/streaming` · **Derech health:** OK

**Source:** `geelooy/api/streaming/_awtsmoos.derech.js` · **Discovery:** static-literal · **Confidence:** unknown-method

[Read the human Streaming tutorial](../../../TUTORIALS/API/STREAMING.md)

> Generated evidence is a navigation and teaching aid, not an OpenAPI contract. Unknown evidence stays unknown; inspect current source/tests before production use.

## Contract evidence

- Methods: **unknown**
- Request vessels: `route-vars`
- Observed status literals: —
- Observed headers: `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Origin`, `Cache-Control`

## Path parameters

| Name | Shape |
| --- | --- |
| `connector` | single segment |

## Starter call

No executable starter is generated because method evidence is unknown. Inspect the source handler before choosing a method or payload.

## Observed callers

Pattern-compatible evidence only; it does not prove runtime dispatch.

| Literal | Source | Kind |
| --- | --- | --- |
| `/api/streaming/${connector}` | `geelooy/apps/nesher-studio/modules/streaming/streamingControl.js` | runtime |

## Related tests

No package-script heuristic match was found.

## Related routes

- [`/api/streaming`](./api-streaming-0d2c5324f4.md)
- [`/api/streaming/:connector/:action`](./api-streaming-connector-action-d87f3b29ce.md)
- [`/api/streaming/connector`](./api-streaming-connector-6a59d84a9f.md)
