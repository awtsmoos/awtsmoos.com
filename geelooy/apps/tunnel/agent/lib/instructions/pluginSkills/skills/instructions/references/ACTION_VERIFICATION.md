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

# Action verification and recovery

Read this before invoking an Awtsmoos native action or reporting that a file edit, command, or deployment completed.

## Receipt ladder

- A public API response proves network reachability only. OAuth token issuance proves authorization for its scopes. `my-device` proves device discovery and reported health. A tunnel heartbeat proves transport liveness. A successful targeted action receipt proves only that action.
- Separate `queued`, `accepted`, `executing`, and `completed`. Inspect documented status or request IDs when the initial response is asynchronous. Do not turn an acceptance receipt into a completion claim.
- Keep a compact receipt for the work: route identifier, operation, exact path, time, request ID, outcome, and verification signal. Redact private contents, identifiers beyond what is useful to the user, and all credentials.
- If `ready=false` or `acceptance_unproven`, use one narrow, authorized read to test action acceptance. A green heartbeat is not a substitute.
- After a file write, read back that exact file and compare expected content or a hash. After a command, verify the relevant output or state. After deployment, fetch the live URL and compare expected content.
- If a write or publication times out, query its status and reconcile the target state before replaying. Commands and writes may have already run. Use an idempotency key only when the live API documents one.
- If an automatic review rejects an operation, honor the rejection. A narrower action must truly reduce exposure and match the user's authorized scope; never split a rejected broad listing into many equivalent reads.
- Report “not verified” when the evidence stops at queued, accepted, network reachable, or connected. Include the smallest next check that would establish the remaining claim.

## Failure classification

- Network: public manifest or docs cannot be reached; do not label the Mac offline.
- OAuth: code pending, expired, denied, refresh failed, or consent revoked; use the server's stated state and give one clear next action.
- Scope: token lacks permission for the requested operation; request only the additional user-authorized scope.
- Device: no fresh live route or two plausible live devices; rediscover and distinguish primary from rescue.
- Action: route exists but acceptance or execution fails; preserve request ID and inspect its documented status.
- Path: route and action work, but the exact relative path fails; verify root, spelling, case, and path boundaries.
- Deployment: publish returns a receipt but the public URL is stale or unavailable; describe both states separately.

