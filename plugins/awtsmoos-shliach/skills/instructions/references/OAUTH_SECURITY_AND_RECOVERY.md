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

# OAuth safety, routing, and recovery

Use this guide for Awtsmoos login across plugins, especially when diagnosing failed authorization or a Mac that appears connected but rejects actions. Keep the user in control of scopes and preserve a clear distinction between authentication, route discovery, and action acceptance.

## Credential lifecycle

- Device authorization returns a `user_code` for the human and a distinct `device_code` for the client. Show only the short user code and verification URL. The user approves on the Awtsmoos origin; the client exchanges the device code for tokens. Respect the server's poll interval and terminal errors.
- PKCE S256 uses a high-entropy verifier, its challenge, and a separate state value. Verify the returned state exactly before token exchange. A callback code is short-lived and is not a bearer token. Never publish the verifier, state, code, access token, or refresh token.
- Use HTTPS and validate the exact Awtsmoos origin. Do not send credentials to a lookalike domain, unrelated plugin, third-party proxy, browser page, or log collector. Follow the target product's secure authentication method when it provides one.
- Keep tokens in an approved secret store or an owner-readable temporary file protected from other users. Do not print complete API responses if they might contain tokens, cookies, private paths, or private file contents. Remove temporary credentials when the task is finished or the environment is no longer trusted.
- If an access token expires and a refresh token was issued, refresh through the documented token endpoint with the proper client ID. Treat refresh failure as requiring a new authorization; never ask the user to paste the refresh token into chat.
- If a user denies or cancels, stop polling and do not start another authorization attempt until requested. If the OAuth server reports `slow_down`, wait longer. If it expires, explain that a fresh short code is required.

## Route selection and proof

- `my-device` may return both `awt-awtsmoos-2184` and a rescue route, plus stale routes. These were examples observed on September 24, 2026; rediscover current IDs each session. `multiple_authorized_tunnels` can accompany a usable device list. Select only a device that matches the user's requested machine and has fresh liveness evidence; ask if multiple plausible live choices remain.
- Read `connected`, `isAlive`, `executionHealthy`, `ready`, `readinessState`, and action receipts separately. A heartbeat means a transport exists. `acceptance_unproven` means no fresh individual action has established successful acceptance. A scoped, targeted read can prove that specific action works.
- Use the immutable route ID in the field named `tunnelName` or the URL segment specified by live docs. Do not replace it with a friendly label or a stale tunnel ID. Confirm the response's actual route, action, and path before reporting success.
- For a native Mac rooted at `/Users/awtsmoos/work`, an API path may be relative to that workspace, such as `awtsmoos.com/geelooy/apps/tunnel/README.md`. Rediscover the current root and validate the requested path. Do not assume a GitHub path, Virtual OS path, and native filesystem path refer to the same bytes.
- Start with the narrowest user-authorized read. Set bounded sizes and pagination limits. Avoid broad `p=.` listings of a private workspace. If automatic review rejects a broad request, obey it and use a genuinely narrower authorized path only when supported by the user's request; do not recreate the same disclosure through another operation.
- A `tunnel.read` token cannot write, run commands, control a browser, or publish. To perform such a user-requested task, start a new authorization with the required scope; then confirm the target action is supported and independently verify its receipt.

## Failure map

- Network failure: Test the public manifest or docs without credentials; report the unreachable endpoint, not a failed Mac tunnel.
- Authorization pending: Show the verification URL and code, then wait within the allowed interval. Do not claim approval from the browser redirect alone.
- Unauthorized or insufficient scope: Check token status and documented scope requirements; reauthorize only for the capability the user requested.
- No live route: Distinguish stale tunnels from connected native or Virtual OS routes; use the repository's recovery guidance rather than installing repeatedly.
- Action timeout or acceptance failure: Check the returned request ID and status in the documented API; do not infer a write failed or succeeded solely from a timeout. Avoid replaying non-idempotent actions without reconciliation.
- Path error: Verify root, route, case, and relative path before concluding that a file does not exist.
- Product limitation: A plugin that only ships skills cannot invoke an absent action. Describe the required HTTPS client, app, or MCP connection plainly; do not imply that editing prose changes account permissions.

