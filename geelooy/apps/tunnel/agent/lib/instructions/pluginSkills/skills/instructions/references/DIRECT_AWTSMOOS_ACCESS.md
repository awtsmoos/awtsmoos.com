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

## Direct Awtsmoos access when plugin actions are unavailable

The Awtsmoos Tunnel Control API can be used through ordinary HTTPS requests even when this plugin has no connected action or MCP tool. Never claim that instructions alone grant tool access. At the start of a Mac or Virtual OS task, discover the tools actually available in this session. If native Awtsmoos tools are present, use them. Otherwise, check whether the current execution environment can reach `https://awtsmoos.com/api/tunnel/control/agent-manifest` and `https://awtsmoos.com/api/tunnel/control/docs.json`. Browser access to the public control page is not proof that authenticated machine actions work. Do not demand Developer mode or an MCP plugin when direct HTTPS is available.

Read the live manifest and docs before constructing requests; endpoint schemas, action names, scopes, and routing rules can change. The public GitHub directory `geelooy/apps/tunnel` documents the system, while `/api/tunnel/control/agent-manifest` and `/api/tunnel/control/docs.json` describe the deployed API. Check each claim about the user's machine against an actual authenticated response. Do not treat a screenshot of a connected tunnel as proof that an individual action succeeds.

### Authorization

Use the `external-agent` OAuth client. Prefer authorization code with PKCE S256 when a secure callback handoff is available. A headless HTTPS client may use device authorization:
1. POST `client_id=external-agent` and only the scopes needed for the present task to `https://awtsmoos.com/api/oauth/device-authorization`. For an initial connection check or file read, request `profile tunnel.read`. Do not ask for `tunnel.write`, `tunnel.command`, or `tunnel.browser` until the user requests work that requires those powers.
2. Show the user the returned `verification_uri_complete` and `user_code`. Say which scopes are requested and when the code expires. Approval must occur on Awtsmoos; never ask the user to paste a password, bearer token, refresh token, or device code into chat.
3. Poll `https://awtsmoos.com/api/oauth/token` with `grant_type=urn:ietf:params:oauth:grant-type:device_code`, `client_id=external-agent`, and the returned `device_code`. Honor `interval`, `slow_down`, expiration, denial, and terminal errors. Do not treat `authorization_pending` as approval.
4. Keep the device code, access token, and refresh token out of chat, command output, logs, URLs, repositories, and browser-visible page text. Store credentials only in an approved private credential store, or a restricted temporary file when the environment supports one; remove temporary credentials when no longer needed. Never include tokens in the final answer.
5. Call `GET https://awtsmoos.com/api/tunnel/control/my-device` with `Authorization: Bearer <access_token>`. A response can contain several old or rescue tunnels and can report `multiple_authorized_tunnels` while still describing a live device. Select the intended device by fresh liveness, the user's stated machine, and the immutable `routeReference` (otherwise `tunnelId`); never route by a friendly display name when an immutable route exists. Ask only when two plausible live devices remain.

### Prove the requested action

Send the immutable route as the `:tunnelName` segment to `https://awtsmoos.com/api/tunnel/control/fs/:tunnelName`. The live docs describe GET query parameters for small calls and POST JSON for larger calls. For a targeted read, use `action=read`, `p=<specific relative path>`, and a bounded `maxChars`. The workspace root reported by the Mac tunnel in September 2026 was `/Users/awtsmoos/work`; `awtsmoos.com/geelooy/apps/tunnel/README.md` was successfully read from that root through `awt-awtsmoos-2184`. Treat these as historical examples, not permanent paths or routes: rediscover them from the current device and user request.

Keep reads scoped to the user's requested folder or known file. Avoid listing a broad root such as `p=.` solely to test connectivity; it may expose unrelated private filenames. A successful `my-device` heartbeat proves connectivity, and a successful targeted read proves file access. If an automatic approval review rejects a broad request, honor the rejection, choose a genuinely narrower authorized target, and explain any remaining limitation. Do not work around a rejected operation with an indirect or equivalent broad action.

Distinguish the server's transport receipt from a completed file action. Report the returned `ok`, actual action, path, and any error without disclosing private contents unnecessarily. If `ready=false` or `acceptance_unproven` appears in discovery, test an authorized, narrow action before claiming that action acceptance is healthy. A read-only token cannot write or run commands. For requested edits, request the necessary OAuth scope through a new authorization flow and preserve the user's constraints. Never infer write authority from capabilities advertised by the Mac agent; the bearer token's scopes still apply.

For the Virtual OS, the docs advertise an independently available route, but browser pages that stay on “Starting Geelooy OS…” do not establish file access. Use an authenticated API action with a narrow path to verify it, and keep hosted files distinct from native Mac paths. When a connection fails, report which layer failed: network reachability, OAuth, device discovery, routing, action acceptance, or the file path. Give the user a concrete next step without claiming access that was not proven.

