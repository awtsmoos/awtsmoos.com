B"H
Boruch Hashem
Blessed is He

# Awtsmoos.com API Guide

The Awtsmoos gives each endpoint a vessel and each learner two complementary maps: human family teaching for meaning, generated route tutorials for exhaustive current evidence.

## API architecture

Most dynamic HTTP source lives beneath `geelooy/api/` and mounts through ancestor-discovered `_awtsmoos.derech.js`. Root `index.js` also owns a few direct handlers. WebSocket applications are a separate realtime plane.

Dynamic URL variables use `:name` and terminal `:name*`. `$i`, `$_GET`, `$_POST`, `$_DELETE`, cookies, headers, trusted identity, and DB context are request/data vessels—not URL syntax.

## Learn the calling model

Before using unfamiliar endpoints, read:

- [../LEARN/HTTP_ROUTING_101.md](../LEARN/HTTP_ROUTING_101.md)
- [../LEARN/API_REQUESTS_101.md](../LEARN/API_REQUESTS_101.md)
- [../LEARN/AUTHENTICATION_101.md](../LEARN/AUTHENTICATION_101.md)
- [../LEARN/RESPONSES_101.md](../LEARN/RESPONSES_101.md)
- [../LEARN/TRACE_A_REQUEST.md](../LEARN/TRACE_A_REQUEST.md)

## Every route gets generated teaching

[../GENERATED/API_TUTORIAL_INDEX.md](../GENERATED/API_TUTORIAL_INDEX.md) is the exhaustive route entry. Each generated route tutorial includes:

- stable route/tutorial identity;
- family + owning derech/source + syntax health;
- dynamic path variables;
- source-level method, request-vessel, status, and header evidence;
- selected pattern-compatible callers;
- heuristic related test scripts;
- related routes;
- guarded curl/browser-fetch starters only when method evidence exists.

Generated tutorials are conservative source analysis, not OpenAPI. `unknown` method evidence remains unknown. Caller/test matches aid navigation and do not prove runtime execution.

## Human family tutorials

All cataloged mounts have a manual under [../TUTORIALS/API/](../TUTORIALS/API/). Major examples include Social, Tunnel Control, OAuth, YouTube, Wallet, GPT, Compiler, Runtime, Fetch, Contact, Email, Sefarim, Streaming and the specialized/zero-row/unhealthy mounts.

Use [../GENERATED/API_FAMILY_TUTORIALS.md](../GENERATED/API_FAMILY_TUTORIALS.md) for the current generated family census rather than copying snapshot counts into prose.

## Other generated evidence

- [../GENERATED/API_ROUTE_CONTRACT_ATLAS.md](../GENERATED/API_ROUTE_CONTRACT_ATLAS.md)
- [../GENERATED/API_CALLER_INDEX.md](../GENERATED/API_CALLER_INDEX.md)
- [../GENERATED/DYNAMIC_PARAMETER_INVENTORY.md](../GENERATED/DYNAMIC_PARAMETER_INVENTORY.md)
- [../GENERATED/DERECH_HEALTH.md](../GENERATED/DERECH_HEALTH.md)
- [../GENERATED/TEST_OWNERSHIP.md](../GENERATED/TEST_OWNERSHIP.md)

## Known health caveat

The Text derech remains the known syntax-invalid API mount in current inspected source. Its extracted route strings are useful intended/source evidence, not proof of a runnable endpoint until health turns green.

## Browser experience

`/docs/?view=api` exposes the generated route model as a filterable API Explorer with source/caller/test/evidence panes, family/full-tutorial links, copyable source paths and route-aware Ask.
