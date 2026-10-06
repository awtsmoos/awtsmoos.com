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

# Awtsmoos connection runbook

Use this runbook when the user asks a plugin to inspect a Mac, hosted files, or the tunnel, and when another plugin needs an easy login path. Read the live Awtsmoos API manifest and docs before forming requests. The steps below describe decision points, not permanent route IDs or a grant of authority.

## First contact: choose the available path

1. Inspect the tools the current session actually exposes. If the plugin has a working Awtsmoos action, use it. If it has an HTTPS client, test the public manifest and docs. If it has a supported MCP connection, use that connection. Do not tell the user to install or configure something until these checks show a real gap.
2. Distinguish the requested data source. Native Mac files require a connected tunnel and an authorized route. Hosted Virtual OS files may use a separate route. Public repository files may be read directly from their public source. Do not infer one source has the same content as another.
3. Determine the smallest necessary OAuth scopes before starting login. A status check or targeted file read begins with `profile tunnel.read`; edits and commands require separate task-specific scopes.
4. If the client already holds a valid credential for this exact Awtsmoos account and client, use its supported secure storage to test `my-device`. Never print or copy the credential into a different plugin. If no valid credential is available, begin the supported authorization flow.
5. For device authorization, present one short instruction containing the first-party verification link, user code, requested scopes, and expiry. Example: “Open this Awtsmoos page and approve code ABCD-EFGH. It grants read access for this task and expires in 15 minutes.” Use actual response values; never invent a code or expiry.
6. After the human approves, finish token exchange, call `my-device`, choose the intended immutable live route, and continue the original task. Do not ask the user to restate the request. If two plausible live devices remain, ask the user to choose them by recognizable names.
7. Run a narrow, bounded read of the requested path. A live heartbeat does not prove that a file action succeeds. Report exactly what was verified and identify the next missing permission or path only if the action cannot complete.

## Returning user: reduce friction

- Begin by testing the existing supported connection, when the current client securely retains one. Do not generate another device code merely because a new chat started; equally, do not assume a prior chat's ephemeral token survived.
- When `my-device` succeeds, reuse its fresh route metadata, not a saved friendly tunnel name. If a previously chosen route is stale, rediscover and select according to live evidence.
- Refresh an expired access token through the documented flow if a refresh token is securely held by this same client. If refresh fails or consent was revoked, request a new short code and explain why.
- Do not ask the user to approve the same scope twice during one valid authorization. Do not silently request broader scope than the current task needs.
- If the user asks “Can you see my Mac files?”, prove access with one specific file they named or a narrowly authorized project file; do not list the whole workspace by default.

## Clear outcomes and recovery

- Name the failing layer in plain language: public network access, OAuth authorization, token scope, device discovery, stale route, action acceptance, or file path. Give one concrete next step for that layer.
- A connected Mac and healthy execution receipt can coexist with `acceptance_unproven`. A successful targeted action resolves that narrower uncertainty. Do not call all access “working” before an action receipt proves it.
- If an action times out, check its request ID and documented status before replaying it. Do not duplicate a write, command, or publication because the response was delayed.
- If a broad request is blocked by automatic approval review, honor the block. Narrow the target only when the user authorized that exact scope and the alternative is genuinely safer; otherwise explain the limitation and obtain the needed authorization.
- When authentication is missing, keep instructions short: one link and code, one sentence about permissions, then resume after approval. Never request passwords, raw access tokens, or browser cookies in chat.

## Coding and plugin quality gate

- Before writing code, inspect the real source, decide module boundaries, and preserve unrelated work. Each touched file must contain no more than 120 lines; code indentation uses tabs only. Split a large change into named modules instead of squeezing code onto long lines.
- Verify each touched file after writing: line count, leading indentation, syntax where relevant, behavior of changed functionality, and preservation of requested files. Do not claim a backend-normalized manifest uses tabs if the stored version was reformatted.
- For a plugin update, retain all existing prompts, assets, skills, app attachments, and metadata unless the user requests a change. A new instruction cannot attach a tool by itself. Read back the published release and distinguish its verified instructions from unavailable integrations.

