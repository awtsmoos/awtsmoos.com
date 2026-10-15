# B"H — Portal API (geelooy/api/portal/)

One read-only Portal doorway: discovers capabilities, types, and real
API-family resources without disturbing legacy paths. HTTP extraction and error
translation live outside the read service so transport never confuses domain
meaning.

## Contents
- `_awtsmoos.derech.js` — routes: `/`, `/types`, `/type`, `/api-families`, `/api-family`
- `contracts/` — 12 resource/type/query/job/action/error/provenance contract definitions.
- `core/` — `PortalHttpHandlers.js`, `PortalReadService.js`.
- `registry/` — builtin types, capability root, type registry.
- `adapters/` — `ApiFamilyResourceAdapter.js` bridging real API families.
- `tests/` — capability, envelope, read-service, and registry-adapter contract tests.

## Endpoints
- `/` — portal root / capability discovery.
- `/types` / `/type` — list and describe portal types.
- `/api-families` / `/api-family` — discover API families and one family's resources.

See subdir READMEs for the contract, core, registry, adapter, and test layers.
