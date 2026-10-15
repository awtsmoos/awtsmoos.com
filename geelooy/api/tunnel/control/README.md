# B"H — Tunnel Control API (Yaakov 2026-10-15)

Main API for tunnel pairing, command execution, and device management.

## Routes

- `pairing/` — Device pairing (request, state, approve, status, page)
- `simpleTunnel.js` — Simple tunnel (cmd, poll, result, setup, request, approved)
- `myDevice.js` — List user's tunnels (requires auth)
- `liveCalls.js` — Real-time call handling
- `agentFlow.js` — Agent lifecycle

## Pairing Flow

1. `POST /pairing/request` — Create pairing, returns pairingId + userCode + requestSecret
   - **SAVE the requestSecret immediately!** Needed to consume the credential.
2. `GET /pairing/state?pairingId=...` — Check if approved (poll this)
   - Works with both GET (query) and POST (body)
3. User approves via browser at `/pairing/page?pairingId=...&pairingCode=...`
4. `POST /pairing/status` — Consume with pairingId + requestSecret, returns encrypted credential
5. Agent decrypts credential and connects via WebSocket

## Simple Tunnel Flow

1. `POST /simple/cmd` — Queue command (requires secret, optional agentId)
2. Agent polls `GET /simple/poll?agentId=...`
3. Agent executes, posts to `POST /simple/result`
4. Client gets result via `GET /simple/result?id=...`

## Core Modules

- `core/tunnelSecurity/` — Binding store, pairing store, authentication
- `core/auth.js` — Request authentication
- `core/request.js` — Body/query parsing helpers

## Critical Bugs Fixed (2026-10-15)

1. `pairingState` ignored GET query params → now reads both body and query
2. Manual approval searched wrong store → now uses dedicated pairing file
3. `verifyRegistration` blocked empty tunnelId → now uses fallback
4. Pairing file errors swallowed → now logged
