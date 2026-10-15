# B"H — Ohrbound API (geelooy/api/ohrbound/)

Game API for Ohrbound: cloud progress tracking per player alias plus a
community-published level catalog. Mounted from an immutable route table with
no-store response headers.

## Contents
- `_awtsmoos.derech.js` — mounts `routes/table.js`; `Cache-Control: no-store`.
- `routes/` — `progress/:alias`, `levels` route implementations + table.
- `contracts/` — `progressContract.js` (bounded progress doc, v1, max 200
  completed levels), `levelPolicyContract.js`.
- `services/` — authorization, level policy, object gateway, API response envelope.
- `test/` — node tests for authorization and level policy.

## Endpoints
- `progress/:alias` — GET/POST one bounded progress document bound to an alias.
- `levels` — GET/POST/DELETE community level intents (public catalog, publish, delete).

## Design
Routes are frozen data (not registration order); domain, authorization, and
persistence stay in separate modules. See subdir READMEs.
