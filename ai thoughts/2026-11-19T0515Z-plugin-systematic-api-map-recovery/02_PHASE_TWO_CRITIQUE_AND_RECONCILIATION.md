B"H
Boruch Hashem
Blessed is He

# Phase Two — Critique and Reconciliation

The Awtsmoos renews the vessel, yet every boundary must be clear;
Awtsmoos.com can publish evidence while guarded deeds remain sincere.

This pass records project decisions and review improvements, not private chain-of-thought.

## Reconciled architecture

Use Architecture E from phase one: one public Tunnel Control evidence-map route backed by generated machine-readable API tutorial indexes, plus one MCP wrapper. Do not widen `app-api/call` and do not run source discovery at request time.

## Improvements over phase one

1. Use the generated manifest as the only authority for which chunk files may be opened; never accept a chunk/file path from user input.
2. Validate chunk names against a narrow `routes-NNN.json` pattern before joining paths.
3. Resolve the repository root internally and never include absolute filesystem paths in responses.
4. Cache the assembled index by generated-manifest modification time so requests are cheap but docs regeneration becomes visible without process restart.
5. Treat cache failure as a structured `map_unavailable` response instead of throwing a raw filesystem error.
6. Preserve manifest counts as generation metadata while independently returning current filtered/page counts.
7. Default to a small page size rather than dumping all 687 routes.
8. Cap page size at a fixed maximum so MCP and HTTP responses cannot become accidental large-output channels.
9. Use numeric `offset` pagination because the generated route order is deterministic and already sorted.
10. Clamp/validate offsets rather than allowing negative, fractional, NaN, or enormous values.
11. Bound free-text query length before searching.
12. Search only stable route-index fields: route, family, source, ID, and manual pointer.
13. Make family filtering exact against the generated `family` field rather than fuzzy prefix inference.
14. Return route records unchanged except for adding no local absolute path data.
15. Include an explicit warning that discovery evidence does not prove runtime health, method, public accessibility, authentication class, or application-call eligibility.
16. Link the response to `/api/catalog` for family discovery and `/api/portal/api-families` for typed family resources.
17. Link separately to `/api/tunnel/control/app-api/catalog` for the executable allowlist.
18. Link separately to `/api/tunnel/control/app-api/call` for guarded execution, so map and authority remain visually distinct.
19. Add `awtsmoos_api_map` as read-only/open-world-false MCP metadata because it reads Awtsmoos-owned generated evidence only.
20. Reuse the HTTP route through `invokeRoute` from MCP rather than duplicating filtering logic.
21. Put MCP schema definition in its own small catalog module if adding it to `extendedCatalog.js` would make that file crowded or exceed style goals.
22. Avoid touching the existing 144-line `appApiGateway.test.cjs`; add dedicated map tests instead.
23. Avoid touching the 146-line `appApiCallRoute.js`; the new work must not deepen that oversized file.
24. Avoid touching the 152-line `docs/catalog.js` unless a later test proves it is required for discoverability.
25. Rewrite every touched existing source file completely, with tabs and canonical B"H headers.
26. Keep each new JavaScript file materially below 120 lines so future commentary and tests have room.
27. Keep tests separated by concern: HTTP/map service behavior vs MCP catalog/invocation wiring.
28. Update both plugin instruction mirrors in the same pass and verify equality byte-for-byte.
29. Add examples that show discovery first, then public HTTPS for genuinely public routes, and curated application calls for authenticated actions.
30. Never tell agents to call a discovered private route merely because it appears in the map.
31. Regenerate docs after code is written because the new `app-api/map` route itself must enter the 687-row source-derived universe.
32. Expect the route count to change after regeneration; tests must not hard-code 687 as a permanent invariant.
33. Validate the map against manifest `routeCount` at load time so missing/stale chunks are detected rather than silently served incompletely.
34. Deduplicate route IDs defensively and fail closed if generated indexes disagree with their manifest count.
35. Preserve stable generated ordering to make offset pagination repeatable.
36. Do not read route detail records unless a future endpoint explicitly requests one; the map index already contains enough navigation metadata.
37. Keep the map endpoint read-only with no OAuth requirement, matching its role as evidence publication rather than account action.
38. Let the existing generic HTTPS tool call the map as public Awtsmoos HTTP, while the first-class MCP map tool offers a simpler plugin path.
39. Preserve all existing tool names and schemas for backward compatibility.
40. Treat deployment as a separate gated phase after commit/push and shared-agent coordination.

## Failure map

- Missing manifest -> structured unavailable response.
- Malformed manifest -> structured unavailable response with non-secret reason class.
- Missing chunk -> fail the map load; never publish a silently partial catalog.
- Chunk route count mismatch -> fail closed.
- Invalid user limit/offset -> normalize or return bounded validation error; never allocate from user-provided size.
- Search returns zero -> valid empty page with counts.
- Generated evidence contains archived route -> preserve it as generated evidence with warning, not as runtime claim.
- MCP caller lacks application scope -> map still read-only; application calls remain independently scoped.
- Docs regenerated while process lives -> manifest mtime invalidates cache.

## Practical write boundary

Expected source work is limited to the new map modules/route, the small app API route group, MCP map catalog/invocation wiring, two instruction mirrors, and new focused tests. Larger legacy files remain untouched.
