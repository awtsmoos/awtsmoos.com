B"H
Boruch Hashem
Blessed is He

# Awtsmoos Tunnel Control — Universal AI Agent Instructions

> The Awtsmoos renews visible browsers and silent daemons alike; Awtsmoos.com therefore teaches two consent paths, one token authority, and one immutable tunnel route, so no model confuses headless convenience with permission.

These instructions govern any external AI client using Tunnel Control, OAuth, the action API, or OpenAPI. New clients should use `client_id=external-agent`.

## Canonical discovery

- OAuth metadata: <https://awtsmoos.com/.well-known/oauth-authorization-server>
- Agent Manifest: <https://awtsmoos.com/api/tunnel/control/agent-manifest>
- Device authorization endpoint: <https://awtsmoos.com/api/oauth/device-authorization>
- Human device verification: <https://awtsmoos.com/api/oauth/device>
- Agent bootstrap: <https://awtsmoos.com/api/tunnel/control/bootstrap>
- Human docs: <https://awtsmoos.com/api/tunnel/control/docs>
- OpenAPI: <https://awtsmoos.com/api/tunnel/control/openapi>
- Device discovery: <https://awtsmoos.com/api/tunnel/control/my-device>

Read live metadata, manifest, or OpenAPI whenever payload shape is uncertain. Do not infer unsupported fields from memory.

## Mode A — PKCE callback authorization

Prefer this when the AI can retain PKCE/state and receive or relay the browser callback code.

1. Generate and retain high-entropy `code_verifier` and `state`.
2. Derive the S256 `code_challenge`.
3. Open `/api/oauth/authorize` with `client_id=external-agent`, the fixed callback, scope, state, challenge, and `code_challenge_method=S256`.
4. The first-party callback displays only authorization code and state.
5. Reject the flow unless returned state exactly matches retained state.
6. Exchange at `/api/oauth/token` with the original verifier and fixed callback.
7. Store access/refresh tokens only in the AI client's secure credential store.

## Mode B — Headless Device Authorization

Use this when the AI cannot receive or relay the callback code.

1. POST `client_id=external-agent` and optional `scope` to `/api/oauth/device-authorization`.
2. Retain `device_code`, `expires_in`, and `interval`. Show the human `verification_uri` + `user_code`, or `verification_uri_complete`.
3. Poll `/api/oauth/token` with:
   - `grant_type=urn:ietf:params:oauth:grant-type:device_code`
   - the returned `device_code`
   - explicit `client_id=external-agent`
4. Never poll faster than the current permitted interval.
5. On `authorization_pending`, wait the interval and continue.
6. On `slow_down`, honor the larger server delay before every subsequent poll.
7. On `access_denied`, `expired_token`, `invalid_grant`, or another terminal OAuth error, stop polling.
8. On success, store the returned access/refresh tokens securely and discard the device code.

The human verification page requires Awtsmoos login, displays the short user code, client name, and scopes, and requires explicit approve/deny. It never receives or renders the machine device code, access token, or refresh token.

## Compatibility clients

- `grok` remains a public-agent compatibility client with PKCE callback and device authorization capability.
- `chatgpt` retains its registered callback patterns and legacy behavior; device authorization is not silently enabled for it.
- Named clients are compatibility garments, not requirements for new integrations.

## After either OAuth mode

1. Call `/api/tunnel/control/my-device` with `Authorization: Bearer <access_token>`.
2. Use `routeReference`; if absent, use `tunnelId`.
3. Pass that immutable value in the action schema field named `tunnelName`.
4. Treat friendly `tunnelName` as display metadata only.
5. If no tunnel is connected, ask the user to start/refresh the local agent and retry.
6. If multiple tunnels are live, present immutable IDs plus labels and ask which one to use.
7. Never fabricate a route, project root, worker, receipt, job, or action result.

## Start or refresh the local tunnel

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

Running the same installer again refreshes and starts an existing agent while preserving saved identity.

## Action discipline

- After discovery, call `list p=.`, then `tree p=. depth=2 limit=150`, then read real files before mutation.
- Verify immutable route and project root before writes or commands.
- Grant/use only required OAuth scopes.
- Treat filesystem, shell, browser automation, and local proxy access as access to the connected user's machine.
- A durable command with `pending: true` is still alive: preserve its receipt and continue it instead of resubmitting the original command.
- Verify results from actual files, commands, browser state, and tunnel responses.

## Security boundary

Universal support never means arbitrary redirect URIs or invisible device approval. Callback mode is bound by state + PKCE; headless mode is bound by short-lived device state, human login/consent, server poll cadence, expiry, denial, and one-time redemption. Both modes end at the same scoped OAuth token authority.
