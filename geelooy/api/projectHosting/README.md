# B"H — Project Hosting API (geelooy/api/projectHosting/)

Geelooy project hosting: owner-scoped hosting-plan discovery plus authenticated
lifecycle and bounded-observability routes for trusted project runtimes.

## Contents
- `_awtsmoos.derech.js` — composition root: `/` plan route plus spread of
  `runtimeRoutes(info)`.
- `planRoute.js` — owner-scoped declarative hosting-plan route (what's ready,
  what still awaits a vessel).
- `requestIdentity.js` — resolves the authenticated project owner.
- `runtimeRequest.js` — runtime request body parsing.
- `runtimeRouteSupport.js` — route helpers: owner/project guards, activity
  limits, success/failure envelopes.
- `runtimeRoutes.js` — authenticated runtime lifecycle + observability routes.
- `runtimeRoutes.test.cjs`, `runtimeRouteSupport.test.cjs` — node tests.

## Endpoints
- `/` — hosting plan bound to the authenticated owner.
- runtime routes — trusted Geelooy project runtime lifecycle (start/stop/status)
  and bounded observability, all owner-scoped.
