# B"H — OAuth API (`/api/oauth/`)

Delegated authorization: clients, tokens, device flow, and agent handoff.
Trust enters by explicit authorization, never by client-declared identity.

## Subdirectories

- `core/` — Token, client, device-code, scope, and PKCE logic.
- `routes/` — HTTP route handlers (authorize, token, device, agent links).
- `views/` — Approval and login page renderers.
- `tools/` — Body parsing, HTML helpers, URL builders, responders.
- `data/` — Seed data (clients, public agent policy).

## Files

- `_awtsmoos.derech.js` — Route registration.
- `DOCUMENTATION.md` — Full OAuth documentation.

## Main routes

- `authorize` / `start` — Begin the authorization flow.
- `token` — Exchange codes for tokens (see `routes/`).
- `deviceAuthorization` / `deviceVerification` — Device flow.
- `me` — Current user info. `logout` — End session.
- `agentLinks` / `agentHandoff` — Agent delegation.

## See also

- `../../../docs/API/OAUTH.md`
- `../../../docs/API/AUTHENTICATION.md`
- `../../../docs/SYSTEMS/AUTH_AND_IDENTITY.md`
