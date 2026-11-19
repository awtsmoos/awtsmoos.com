B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Execution Plan

The Awtsmoos renews Chochmah into Binah; Tiferes gives the map its frame.
Awtsmoos.com lets Malchus publish evidence while guarded actions keep their name.

This is the final observable implementation contract, not private chain-of-thought.

## Final architecture

One reusable service reads generated API-tutorial indexes, applies bounded discovery queries, and returns a provenance-rich evidence map. HTTP and MCP share that service. `app-api/catalog` and `app-api/call` remain the separate executable allowlist and guarded execution gate.

## Final-pass improvements

1. Split storage, query, response, and orchestration into four small class-oriented modules.
2. `ChochmahApiMapStore` owns generated-file reads and cache invalidation only.
3. `BinahApiMapQuery` owns `q`, `family`, `limit`, and `offset` normalization only.
4. `TiferesApiMapDocument` owns response shape and navigation links only.
5. `MalchusApiMapService` composes those modules for HTTP and MCP.
6. Never run a source-tree walk on a request.
7. Only open `MANIFEST.json` and manifest-declared `routes-NNN.json` chunks.
8. Validate chunk names before path joining; user input never selects files.
9. Resolve repository paths internally; never return absolute local paths.
10. Cache by manifest mtime so docs regeneration is visible without restart.
11. Missing/malformed generated data fails closed as `map_unavailable`.
12. Validate manifest schema, chunk arrays, unique route IDs, and route-count agreement.
13. Preserve deterministic generated order for stable offset pagination.
14. Default limit 40; maximum limit 100.
15. Bound search text to 160 characters.
16. Search only id, route, family, source, and manual fields.
17. Family filter matches the generated family identifier exactly.
18. Return filtered count separately from generation totals.
19. Return `nextOffset`/`previousOffset` only when applicable.
20. Mark the response `evidenceOnly` and state that discovery is not authorization.
21. Link `/api/catalog` and `/api/portal/api-families` as family discovery surfaces.
22. Link `app-api/catalog` separately as the executable operation allowlist.
23. Link `app-api/call` separately as guarded execution.
24. Add public `GET /api/tunnel/control/app-api/map` in the existing route group.
25. Add first-class read-only MCP tool `awtsmoos_api_map`.
26. MCP calls the shared service directly instead of synthesizing an HTTP POST context.
27. Put the new MCP schema in a dedicated small `apiMapCatalog.js` module.
28. Compose that module into `toolCatalog.js` without changing old tool names.
29. Add the handler to `toolInvocation.js` while preserving old handlers.
30. Keep `appApiCallRoute.js` and oversized legacy catalog/test files untouched.
31. Rewrite every touched existing source file completely, using tabs and canonical headers.
32. Keep every touched/new JS source below 120 lines.
33. Rewrite both plugin instruction mirrors from identical complete text.
34. Teach map -> verify evidence -> public HTTPS OR curated application call, never map -> arbitrary private call.
35. Add new focused tests instead of enlarging existing 144-line gateway tests.
36. Test real generated loading, filtering, paging, unique IDs, and evidence warning.
37. Test synthetic missing/malformed generated data fails closed.
38. Test HTTP route registration and MCP tool schema/handler/invocation.
39. Run existing application-gateway and generic-MCP tests unchanged as regressions.
40. After source is complete, run syntax, line-count, and indentation checks.
41. Regenerate docs only after code/tests so the new map route enters generated evidence.
42. Never hand-edit generated docs output.
43. Re-read every touched file and record planned-vs-actual delta.
44. Inspect final git diff/status for unrelated shared-agent changes.
45. Commit and push path-scoped verified work before considering deploy.
46. Read deploy law and inspect shared-agent/restart state before deploy/restart.
47. After safe deployment, verify bounded live HTTP map and MCP tool discovery/call.
48. Any live failure becomes remaining work; no completion claim while it remains.

## Exact intended source files

New:
- `geelooy/api/tunnel/control/docs/apiMap/ChochmahApiMapStore.js`
- `geelooy/api/tunnel/control/docs/apiMap/BinahApiMapQuery.js`
- `geelooy/api/tunnel/control/docs/apiMap/TiferesApiMapDocument.js`
- `geelooy/api/tunnel/control/docs/apiMap/MalchusApiMapService.js`
- `geelooy/api/tunnel/control/routes/appApiMapRoute.js`
- `geelooy/api/tunnel/control/mcp/apiMapCatalog.js`

Rewrite completely:
- `geelooy/api/tunnel/control/routes/routeGroups/appApiRoutes.js`
- `geelooy/api/tunnel/control/mcp/genericTools.js`
- `geelooy/api/tunnel/control/mcp/toolCatalog.js`
- `geelooy/api/tunnel/control/mcp/toolInvocation.js`
- `plugins/awtsmoos-shliach/skills/instructions/references/HTTP_API_ACCESS.md`
- `geelooy/apps/tunnel/agent/lib/instructions/pluginSkills/skills/instructions/references/HTTP_API_ACCESS.md`

New tests:
- `geelooy/api/tunnel/control/test/appApiMap.test.cjs`
- `geelooy/api/tunnel/control/mcp/apiMapTool.test.cjs`

Generated outputs may change only through the canonical docs generator after source implementation.

## Execution order

Code first: new modules -> full rewrites of integrations -> full rewrites of instruction mirrors. Then tests -> verification -> reread/delta -> docs regeneration/validation -> regressions -> commit/push -> deployment gate -> live verification.
