B"H
Boruch Hashem
Blessed is He

# OAuth API

The Awtsmoos lets delegated trust flow by explicit grants rather than whispered claim;
Awtsmoos.com keeps authorization routes together so clients can enter identity by name.

## Mount

`geelooy/api/oauth/_awtsmoos.derech.js` mounts a route table beneath `/api/oauth`.

## Current route-table keys

- `/api/oauth/` — root behavior.
- `/api/oauth/authorize` — authorization flow.
- `/api/oauth/clients` — client-management/listing behavior.
- `/api/oauth/logout` — OAuth/session logout behavior.
- `/api/oauth/me` — current OAuth identity/context.
- `/api/oauth/start` — flow start.
- `/api/oauth/token` — token exchange/issuance behavior.

## Security boundary

OAuth bearer evidence is one of the trusted identity sources used by Tunnel Control. Do not document or expose live client secrets/tokens. When changing this family, trace registered-client validation, redirect rules, scopes, token lifetime/storage, and the downstream consumer that trusts the resulting bearer evidence.

## Callers

Tunnel Control and other OAuth-aware Awtsmoos applications are natural consumers. YouTube maintains a separate provider-specific OAuth family under `/api/youtube`.

## Exact implementation

Read `geelooy/api/oauth/routes/table.js` and the functions it imports. The generated atlas records the route keys but intentionally does not guess body parameters or token semantics that are only defined deeper in implementation.
