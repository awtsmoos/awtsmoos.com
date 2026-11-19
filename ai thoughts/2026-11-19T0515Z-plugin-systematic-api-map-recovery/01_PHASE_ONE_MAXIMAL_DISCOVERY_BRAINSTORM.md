B"H
Boruch Hashem
Blessed is He

# Phase One — Maximal Discovery Brainstorm

The Awtsmoos renews every road before a map can name its light;
Awtsmoos.com may reveal many vessels, yet permission remains a separate right.

This is an architectural option record, not hidden reasoning and not a commitment to implement every option.

## Observed project graph

`source routes` -> `scripts/docs/discovery.js` -> `route tutorial records` -> `docs/AI/API_TUTORIALS/*.json`

`application operation definitions` -> `appApiCatalog.js` -> `app-api/catalog` -> `app-api/call`

`Tunnel Control route table` -> `appApiRoutes.js` -> public Tunnel Control HTTP surface

`MCP catalog` -> `toolInvocation.js` -> guarded route/tool handlers -> plugin-visible tools

`plugin source instructions` -> plugin bundle mirror -> installed Shliach guidance

## Architecture A — live filesystem scan on every map request

Possible: require the docs discovery module and call `apiRows()` at request time.

Advantages: always reflects checkout immediately.

Costs: recursively walks source, loads route-table modules, performs synchronous filesystem work, couples runtime API to docs tooling, and can make a read-only discovery call unexpectedly expensive.

Disposition: reject for production request path.

## Architecture B — serve generated machine-readable route tutorial index

Possible: read `docs/AI/API_TUTORIALS/MANIFEST.json`, then its bounded route-index chunks; filter and paginate in a small read service.

Advantages: already generated from current source, bounded chunks, stable route IDs, family/source/manual/record/tutorial links, no request-time source walk.

Costs: generated evidence can be stale until regeneration; includes lexical/archival evidence and does not prove health, method, public status, or authorization.

Disposition: preferred foundation if response language makes provenance explicit.

## Architecture C — extend `/api/portal`

Possible: add endpoint-level typed resources under the existing Portal contract.

Advantages: conceptually systematic and typed.

Costs: larger unrelated surface, Portal currently stops at family level, user specifically pointed to Tunnel Control/plugin work, and this would not by itself create a plugin-native tool.

Disposition: possible future adapter; do not make it the primary continuation.

## Architecture D — MCP-only map

Possible: add `awtsmoos_api_map` that reads generated route evidence without an HTTP route.

Advantages: minimal public HTTP expansion.

Costs: raw Awtsmoos clients cannot use it; duplicates discovery behavior inside MCP; user explicitly recalled an endpoint under Tunnel Control.

Disposition: useful companion, insufficient alone.

## Architecture E — public Tunnel Control map + MCP wrapper

Possible: add `GET /api/tunnel/control/app-api/map` backed by one reusable map service, then have `awtsmoos_api_map` invoke that same route through existing MCP route invocation.

Advantages: one behavior, both HTTP and plugin access, no authorization broadening, clear sibling relationship with `catalog` and `call`.

Costs: must keep responses bounded and generated-data absence graceful.

Disposition: preferred composition.

## Map contract possibilities

A map response can include:

- schema/version and provenance;
- generated route count and family count;
- filtered count;
- bounded page size;
- cursor/offset for continuation;
- optional `family` exact-prefix filter;
- optional text query over route/source/family;
- route ID, route pattern, family, source, manual, detailed record pointer, tutorial pointer;
- clear warnings that source discovery is not runtime or authorization proof;
- links to `/api/catalog`, `/api/portal/api-families`, `/api/tunnel/control/app-api/catalog`, and `/api/tunnel/control/app-api/call`.

## Security and correctness boundaries

- Never execute arbitrary map entries through `app-api/call`.
- Never infer authentication from route location or method evidence.
- Never forward the MCP OAuth bearer to arbitrary Awtsmoos routes.
- Never claim archived lexical paths are healthy runtime routes.
- Never silently promote `unknown` method evidence to GET.
- Never expose repository absolute filesystem paths in public responses.
- Never scan secrets or environment values to build the map.
- Keep route evidence read-only and bounded.

## Candidate file decomposition

New small modules under `geelooy/api/tunnel/control/docs/apiMap/`:

- `ApiMapPaths.js` — generated evidence locations only.
- `ApiMapStore.js` — manifest/chunk loading and bounded cache.
- `ApiMapQuery.js` — validation/filter/pagination.
- `ApiMapDocument.js` — response envelope and navigation links.

New route:

- `geelooy/api/tunnel/control/routes/appApiMapRoute.js`.

Small rewrites:

- `geelooy/api/tunnel/control/routes/routeGroups/appApiRoutes.js`.
- `geelooy/api/tunnel/control/mcp/genericTools.js`.
- `geelooy/api/tunnel/control/mcp/extendedCatalog.js`.
- `geelooy/api/tunnel/control/mcp/toolInvocation.js`.

Documentation mirrors:

- `plugins/awtsmoos-shliach/skills/instructions/references/HTTP_API_ACCESS.md`.
- `geelooy/apps/tunnel/agent/lib/instructions/pluginSkills/skills/instructions/references/HTTP_API_ACCESS.md`.

Focused tests should be new files so the existing 144-line gateway test is not enlarged.

## Verification universe

After implementation: syntax, line limits, tabs, query bounds, missing generated artifacts, malformed chunks, exact family filter, text search, pagination stability, route registration, MCP catalog definition, MCP invocation, old gateway regression, plugin mirror equality, docs regeneration, git diff, runtime public endpoint, runtime MCP tool discovery.
