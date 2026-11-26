# B"H — Tunnel ↔ Rebbe API Integration Ledger

Run: 2026-11-26T0029Z–0045Z (Asia/Ho_Chi_Minh morning) · Commit: `432f1ff56` (pushed to origin/main)
Task: Link the new Rebbe Sichos Search API (commit `e10ddaaad`) into the Tunnel system
(geelooy/api/tunnel + geelooy/apps/tunnel) so the ChatGPT Shliach plugin and other agents
discover and use it — and every other first-class Awtsmoos API — naturally, via compact
injected instructions that expand through links. No questions to Hai; code read first.

## How the tunnel actually talks to agents (read before building)

- **Plugin/OpenAPI instructions:** `routes/openApi.js` serves the checked-in GPT YAML
  (`apps/tunnel-control/gpt/awtsmoos-action-openapi*.yaml`) enriched at runtime:
  `openApiAgentMetadata.enrichYaml` prepends `openApiAgentDescription.agentPrefix()` into
  `info.description` and adds `x-awtsmoos-*` extension lines. The YAML generator
  (`generate-oauth-scopes.cjs`) only regenerates the OAuth scope tail — descriptions are
  source text, and the served enrichment is the live instruction channel. The deliberate
  compact capability surface (awtsmoosTunnelAction etc.) was NOT changed: no new
  operations were added, so the surface contract is untouched by construction.
- **Machine manifest:** `GET /api/tunnel/control/agent-manifest` (`routes/agentManifest.js`)
  — the universal discovery covenant agents fetch.
- **Bootstrap:** `GET /api/tunnel/control/bootstrap` (`routes/bootstrap.js`) — first
  response a connecting client receives, already carries manifest/docs/openapi links.
- **Docs:** `docs` (HTML) / `docs.json` render `docs/catalog.js` — that file had another
  session's uncommitted refactor in flight, so it was deliberately NOT edited; the
  registry is exposed through its own route instead.
- **Route table:** guarded routes mount from `routes/table.js` groups; the registry was
  added to `routeGroups/dataRoutes.js` beside `agent-manifest`.

## Inventory — agent-usable API systems verified in code AND live

| id | system | verification |
|---|---|---|
| rebbe | Rebbe Sichos Search API `/api/rebbe` | derech read end-to-end; `/health` 200 (41 years); search parity 47 / 13 re-verified this run |
| zmanim | Zmanim API `/api/zmanim` | derech routes read (`/day /calendar /range /location /opinions /methodology /health`); `/health` 200 live |
| sefarim | Sefarim API `/api/sefarim` | derech read; live root 200 listing rambam/torahohr/tanach/bavli… |
| ask | Ask intelligence `POST /ask/api` | live POST probe returned a sourced answer envelope; front end `/ask/` |
| social | Social API `/api/social` via tunnel app-api catalog | appApi catalog in tunnel docs (docs.json); auth = session/tunnel OAuth, alias authorization separate |
| portal | Portal API `/api/portal` | live root 200, typed-resource discovery envelope, 4 registered types |
| tunnel | Tunnel Control itself | agent-manifest / bootstrap / openapi / docs |

Everything else in the root federation catalog (`/api/`, backed by
`geelooy/api/core/ApiFamilyCatalogData.js`) is pointed to as a federation entry —
each family owns its own contract, per the catalog's own non-responsibility note.
That data file was missing the new family: a `rebbe` row was added, and live
`GET /api/` now lists `rebbe`.

## What was built

New files:
- `geelooy/api/tunnel/control/docs/apiRegistry.js` — the registry: 7 verified entries
  (name, purpose, baseUrl, descriptorUrl, docsUrl, healthUrl, keyEndpoints, whenToUse,
  auth), `registryBody()`, and `INJECTED_INSTRUCTIONS` (818 chars).
- `geelooy/api/tunnel/control/routes/apiRegistry.js` — public JSON route handler.
- `geelooy/api/tunnel/control/docs/test/apiRegistry.test.cjs` — contract test.

Edits (all additive, +18 lines across 7 files):
- `routes/routeGroups/dataRoutes.js` — registers `apis` → `GET /api/tunnel/control/apis`.
- `routes/openApiAgentDescription.js` — `agentPrefix()` now includes the injected block,
  so the served OpenAPI/plugin description carries it.
- `routes/openApiAgentMetadata.js` — extensions `x-awtsmoos-api-catalog-url`,
  `x-awtsmoos-rebbe-api-url`.
- `routes/agentManifest.js` — manifest gains `apis` (full registry) + `apiInstructions`.
- `routes/bootstrap.js` — bootstrap gains `apis` + `apiInstructions`.
- `geelooy/api/core/ApiFamilyCatalogData.js` — `rebbe` family row.
- `geelooy/apps/tunnel/index.html` — human panel "First-class APIs for agents"
  (registry + manifest links, Rebbe docs + example search, zmanim/sefarim/ask, /api/).

Tunnel action catalog: Rebbe was NOT added as native tunnel actions — the Rebbe API is
public, unauthenticated HTTPS JSON; tunnel actions exist to cross into account/device
authority. Forcing it through the action dispatcher would add auth friction and a second
contract to maintain. The injected-instructions + registry route is the clean fit, and
any agent with web fetch (the plugin included, via its httpGet-class capabilities) can
call it directly. This matches Hai's "injected instructions it can expand to read more".

## Exact injected text (818 chars)

> AWTSMOOS FIRST-CLASS APIs: do not scrape front ends when an API exists. Full machine-readable API catalog: https://awtsmoos.com/api/tunnel/control/apis (also in the agent-manifest under "apis"). REBBE SICHOS: for the Rebbe's sichos by Hebrew month/day/year ALWAYS use the Rebbe Sichos Search API at https://awtsmoos.com/api/rebbe (JSON descriptor at https://awtsmoos.com/api/rebbe/, docs at https://awtsmoos.com/api/rebbe/docs). GET /api/rebbe/search finds every sicha event in a month/day/year or range; GET /api/rebbe/bundle creates a permanent bundle — hand the end user its pageUrl (browser ZIP / merged MP3 / merged WAV) or the direct zipUrl / mergeUrl, never raw Archive.org links. Zmanim, sefarim, social, ask and portal APIs are likewise first-class; their base URLs, key endpoints and docs are in the catalog.

## Tests

- New `apiRegistry.test.cjs` — PASS (registry shape, rebbe first, injected ≤1200 chars,
  prefix/manifest/route wiring).
- Tunnel control core suite: **38/38 PASS** (includes revelation + revelationLegacyGet —
  legacy-GET compatibility intact).
- Docs tests: **3/3 PASS**.
- Control route tests: **17/18 PASS**. The one failure,
  `deviceDiscovery.test.cjs` (expects /Device Authorization/ in enriched OpenAPI),
  reproduces identically (5 pass / 1 fail) in a pristine HEAD worktree — pre-existing,
  not a regression. `apps/tunnel/agent/testing/openApiCompactSurface.test.cjs` also
  fails identically at pristine HEAD — pre-existing.
- All other sessions' dirty paths preserved; commit is scoped to the 10 files above.

## Deployment + live verification

- `systemctl restart awtsmoos.service` — active, new MainPID 1399891; tunnel services
  `awtsmoos-native-supervisor` + `awtsmoos-tunnel-guardian` running; device
  `awt-root-73967` connection-state: `registered`, updatedAt 2026-11-26T00:35:27Z
  (after the restart).
- `GET /api/tunnel/control/apis` — 200, registry JSON with instructions.
- `GET /api/tunnel/control/openapi` — 200, 46,751B; served bytes contain the
  REBBE SICHOS injected block in `info.description` and both new `x-awtsmoos-*`
  extension lines at lines 10–11.
- `GET /api/tunnel/control/agent-manifest` — 200; `apis.count = 7`
  [rebbe, zmanim, sefarim, ask, social, portal, tunnel]; `apiInstructions` present.
- `GET /api/tunnel/control/bootstrap` — 200; `apis.count = 7`, instructions present.
- `GET /api/` — families now include `rebbe`.
- `GET /apps/tunnel/` — served page contains the "First-class APIs for agents" panel.
- **Simulated agent chain** (starting only from what the tunnel injects):
  bootstrap/openapi text → follow catalog link → `GET /api/rebbe/search?month=3&day=19`
  → total **47** → `GET /api/rebbe/bundle?month=1&day=19` → 13 events, 46 tracks,
  250,393,823 bytes, `truncated:false`, pageUrl/zipUrl/mergeUrl/manifestUrl →
  bundle page 200 with Download ZIP / merged UI. Search/bundle consistency spot-check:
  year 5712 · month 3 · day 19 (19 Kislev) = 1 event in both search and bundle paths.

## Limitations

- The hosted ChatGPT plugin itself cannot be invoked from this environment; the
  injection was verified in the exact served OpenAPI bytes the plugin consumes,
  plus manifest and bootstrap — the three channels a connecting agent actually reads.
- An in-browser click-through of the apps/tunnel panel was not performed (no live
  browser channel for a subagent); the panel is static HTML verified in served bytes,
  styled with the page's existing panel classes.
- `deviceDiscovery` and `openApiCompactSurface` pre-existing failures at HEAD are
  recorded above for their owning lanes; not touched here.
