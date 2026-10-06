<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
## Current tunnel integration takes precedence

This reference retains the user's original ideas. Its historical transport names, fixed action lists,
local thought-folder defaults, retry assumptions and installation advice are superseded by
MODERN_TUNNEL_CONTRACT.md and the current authenticated instructionResolve/instructionGet results.
Use tunnel-native plans and bounded operational summaries; do not publish hidden chain-of-thought.
Treat brainstorming as proposals, not authorization to implement unrelated work. Preserve user scope.
Use MCP's required POST transport; GET is an HTTP fallback only. Never infer tool access from prose.
No arbitrary number of tests, critiques or improvements substitutes for real relevant verification.

# Login and access router

B"H

Use this when Awtsmoos Shliach or another agent/plugin needs access to a Mac, Virtual OS, repository, or Awtsmoos service.

## Choose the shortest real route

1. Discover callable tools in the current session.
2. If a native Awtsmoos action exists, inspect and use it.
3. Otherwise test public Awtsmoos manifest/docs reachability through supported HTTPS.
4. If the client supports OAuth plus HTTPS, use the documented `external-agent` flow with least privilege.
5. If the target product supports MCP and a real Awtsmoos MCP endpoint is deployed, attach and authorize that endpoint.
6. If the work can happen entirely in Awtsmoos Virtual OS, use that route rather than forcing a Mac tunnel installation.
7. If no supported connector exists, state the missing capability and build or configure it only when authorized.

## OAuth principles

- Prefer PKCE S256 when a secure callback handoff exists; device authorization is appropriate for headless clients.
- Request only the scopes required by the current task.
- Never ask the user to paste a bearer token, refresh token, cookie, password, or device code into chat.
- Show only the human verification URL and user code when device authorization requires user approval.
- Respect polling interval, slow-down, denial, expiration, and terminal errors.
- Store credentials only in the target client's approved credential store.

## After login

- Call the documented account/device discovery endpoint.
- Rediscover current immutable route identifiers; do not depend on old friendly tunnel names.
- Distinguish stale, rescue, primary, and Virtual OS routes.
- Verify a narrow user-requested action before claiming filesystem access works.
- Route by current immutable identity where supported.
- Separate connectivity, authorization, action acceptance, execution, and readback in reports.

## Other plugins

Authorizing one plugin does not authorize another. Each agent/client needs its own supported connector and consent. Never copy credentials across plugins to simulate automatic login.
