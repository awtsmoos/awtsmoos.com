B"H
Boruch Hashem
Blessed is He

# Awtsmoos Tunnel Control — Universal AI Guide

> The Awtsmoos renews every machine and every route in each instant; Awtsmoos.com gives the human one guarded control room while callback-capable and headless AIs ask through distinct OAuth garments that converge on the same authorized tunnel.

Tunnel Control is the browser and API interface for connected Awtsmoos Tunnel devices. New integrations should use the provider-neutral `external-agent` identity rather than requiring a provider-specific registration.

## Canonical discovery

- Control panel: <https://awtsmoos.com/apps/tunnel-control/>
- OAuth Authorization Server Metadata: <https://awtsmoos.com/.well-known/oauth-authorization-server>
- OAuth metadata alias: <https://awtsmoos.com/api/oauth/metadata>
- Agent Manifest: <https://awtsmoos.com/api/tunnel/control/agent-manifest>
- Enter Device Code: <https://awtsmoos.com/api/oauth/device>
- Human API docs: <https://awtsmoos.com/api/tunnel/control/docs>
- Machine docs: <https://awtsmoos.com/api/tunnel/control/docs.json>
- OpenAPI: <https://awtsmoos.com/api/tunnel/control/openapi>
- Agent bootstrap: <https://awtsmoos.com/api/tunnel/control/bootstrap>
- Device discovery: <https://awtsmoos.com/api/tunnel/control/my-device>

## Mode A — PKCE callback authorization

Prefer this mode when the AI can retain PKCE/state and receive or relay the browser callback code.

1. Generate a high-entropy `code_verifier`, S256 `code_challenge`, and `state`.
2. Open `/api/oauth/authorize` with `client_id=external-agent`, `response_type=code`, the fixed callback, scope, state, challenge, and `code_challenge_method=S256`.
3. The first-party callback displays only the short-lived authorization code and state.
4. Reject the callback unless state exactly matches the retained state.
5. Exchange the code at `/api/oauth/token` using the same client ID, callback, and original verifier.
6. Store returned credentials securely.

## Mode B — Headless Device Authorization

Use this mode when the AI cannot receive or relay the OAuth callback code.

1. POST `client_id=external-agent` and optional `scope` to `/api/oauth/device-authorization`.
2. The response contains a high-entropy `device_code`, short `user_code`, `verification_uri`, `verification_uri_complete`, `expires_in`, and `interval`.
3. Show the human the verification URL and user code. The human signs in, reviews the client/scopes/code, then explicitly approves or denies.
4. Poll `/api/oauth/token` with grant type `urn:ietf:params:oauth:grant-type:device_code`, the returned `device_code`, and explicit `client_id=external-agent`.
5. On `authorization_pending`, wait at least the permitted interval and continue.
6. On `slow_down`, increase the delay according to the server response before subsequent polls.
7. Stop on `access_denied`, `expired_token`, `invalid_grant`, or another terminal OAuth error.
8. On success, store the same access/refresh token format used by callback mode.

The browser verification page never receives or displays the machine `device_code`, access token, or refresh token.

## Compatibility clients

`grok` remains a secretless PKCE/device-capable compatibility client built from the same public-agent policy. `chatgpt` retains its existing registered ChatGPT callback patterns and legacy behavior. New clients should prefer `external-agent`.

## Start or refresh the local tunnel

```bash
curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash
```

```powershell
irm https://awtsmoos.com/api/tunnel/install/windows | iex
```

Running the same installer again refreshes and starts an existing agent while preserving its saved identity.

## After either OAuth mode

Call `/api/tunnel/control/my-device` with `Authorization: Bearer <access_token>`. Use `routeReference`, or `tunnelId` if no route reference exists, as the immutable routing value in the action schema field named `tunnelName`. Friendly tunnel names are display metadata only.

Begin with `list p=.`, then `tree p=. depth=2 limit=150`, then read real files before mutation. A durable command response with `pending: true` is still alive: preserve its receipt and continue it rather than submitting the original command again.

## Security

- Universal support never means arbitrary redirect registration.
- Device authorization never skips human login or explicit consent.
- Do not poll faster than the returned interval.
- Do not embed provider API keys or OAuth secrets in frontend source.
- Keep callback state verification even though PKCE is required.
- Never store OAuth tokens in callback or device-verification pages.
- Grant only scopes required for the task.
- Treat filesystem, shell, browser, and local proxy capabilities as access to the connected user's machine.
