B"H
Boruch Hashem
Blessed is He

# Awtsmoos API

The Awtsmoos renews every domain as its own vessel while one clear doorway lets the whole federation be seen in light;
Awtsmoos.com keeps discovery simple, contracts explicit, and migrations deliberate so deeper power never requires architectural night.

## The root is discovery, not a monolith

`/api/` is the public discovery boundary for Geelooy's API federation. It does not centralize authorization, persistence, validation, or family-specific response semantics.

The root now exposes:

- `GET /api/` — top-level family catalog.
- `GET /api/catalog` — the same explicit catalog for tooling and discovery.

The catalog is backed by `core/ApiFamilyCatalogData.js`; request-time filesystem scanning is intentionally avoided so discovery remains deterministic and testable.

## Federated families

The catalog currently names the observed top-level families:

`admin`, `compiler`, `contact`, `email`, `fetch`, `gpt`, `nav`, `oauth`, `ohr-hagnuz`, `ohrbound`, `perutas`, `projectHosting`, `public`, `runtime`, `sefarim`, `social`, `ssh`, `streaming`, `text`, `tunnel`, `wallet`, `youtube`, `zmanim`, and `zmanimms`.

Each family owns its actual route contract. Do not assume all families use the same authentication, authorization, pagination, mutation, or response-envelope model.

## Social API architecture

`/api/social` is itself a federation of focused route families including aliases, Heichelos, communities, communications, mail, notifications, governance, reactions, search, profiles, publishing, and supporting social-kernel capabilities.

Authentication and alias authorization are separate concerns. Being logged in does not imply authority to act as every alias, moderate every Heichel, or mutate every social resource.

### Communications

The communications facade keeps its existing public paths while its internals are now divided into focused route vessels:

- `CommunicationRouteVessel` — shared request context, HTTP-method policy, body selection, and compatible query-limit behavior.
- `CommunicationOverviewRoutes` — overview, live map, notification digest, and unread count.
- `CommunicationInboxRoutes` — inbox listing/recording, item read state, thread history, and thread read state.
- `_awtsmoos.communications.js` — tiny route-map composer only.

The shared `GevurahRouteMethodPolicy` remains the canonical method guard. `BinahRequestBody` now centralizes the historic POST/PUT/PATCH body precedence without performing domain validation.

No communications path was renamed by this refactor.

## Email

`/api/email` is intentionally a compact compatibility gateway over the proven Social Mail engine. It should not grow a parallel mail implementation merely for naming symmetry.

Its discovery response exposes capabilities and the shared request-policy settings route. Chat, group invitation, and mail consent are therefore able to use one private-contact policy model rather than unrelated preference systems.

## Response compatibility

There is no forced universal response envelope across every existing family. That kind of bulk normalization would silently break callers and erase useful domain meaning.

New code should prefer clear success/error contracts and documented payloads, while existing families migrate only with explicit evidence, tests, and compatibility planning.

## Legacy root compatibility

The previous root contained four public demo behaviors:

- `wow/:asd/asd/:rt/k`
- `even/:asd/more/:rt/k`
- `what/:are/you/:doing`
- `/newEndpoint/hi`

They are now isolated in `core/LegacyApiDemoRoutes.js` with their observed response shapes preserved exactly. They were not deleted because no complete caller analysis has yet proved removal safe.

The historic `Access-Control-Allow-Origin: *` root header is also preserved for compatibility. Narrowing CORS belongs in a dedicated migration with caller evidence and cross-origin tests, not inside an organizational refactor.

## Extension rules

When adding or improving an API family:

1. Keep the public route facade small.
2. Put domain policy, orchestration, persistence, and adapters in focused modules.
3. Reuse shared helpers only when behavior is genuinely shared.
4. Keep authorization close to domain truth; never infer it from UI state.
5. Preserve existing external contracts unless a tested migration explicitly changes them.
6. Add the family to the root catalog only when the top-level path truly exists.
7. Update family-specific documentation and tests alongside behavior.

## Canonical documentation

The maintained API documentation entry point is:

`docs/API/README.md`

That documentation points to the generated route atlas, endpoint index, response patterns, and family-specific guides. Generated documentation should be regenerated from source rather than hand-edited as if it were authoritative source code.
