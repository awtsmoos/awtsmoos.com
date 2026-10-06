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

# Plugin integration and connection doctor

Use this when another plugin needs Awtsmoos login or the user asks for a concise connection diagnosis. This is a procedure over existing supported HTTPS or app tools. It is not an MCP server or a new callable tool by itself.

## A focused integration

- Expose a small tool catalog first: authenticated profile, `my-device`, one scoped file read/list operation, and only the write or command actions the workflow needs. Do not expose the entire Awtsmoos action inventory by default.
- Give each tool a precise schema, path bounds, required OAuth scope, and truthful read/write/destructive annotation. The server, not the model, must enforce account ownership and access.
- A profile tool should identify the connected Awtsmoos account without returning tokens. Test that account and route identity are correct before accessing files.
- Build `test connection` as a status check plus an optional narrow read of a user-named file. Do not list `p=.` or browse a private workspace to make a green indicator.
- Return distinct, concise errors for missing scope, stale route, offline agent, invalid path, expired token, and action rejection. Include a safe next step, not a raw credential or private log.
- Test successful login, refresh, consent denial, account mismatch, two live routes, stale primary with live rescue, offline Mac, and a successful bounded read. Keep each plugin's tokens in that plugin's approved credential store; no cross-plugin copying.
- Verify current product support before giving UI instructions. A legacy GPT Action, a ChatGPT plugin skill, a custom MCP app, and a direct HTTPS client have different connection surfaces and may differ by account plan.

## Connection doctor sequence

1. Check whether the current session has a callable Awtsmoos tool or an HTTPS client. Test the public manifest and docs for reachability without exposing private state.
2. Check whether this exact client has a valid securely stored OAuth connection. If not, report `AUTH_REQUIRED` and start the shortest supported authorization only when the user asks for access.
3. With a valid token, call `my-device`. Report `NO_LIVE_DEVICE`, `MULTIPLE_LIVE_DEVICES`, or the chosen live route. Distinguish primary, rescue, and Virtual OS. Do not display unnecessary private device metadata.
4. Report scope separately: `READ_GRANTED`, `WRITE_GRANTED`, `COMMAND_GRANTED`, or `SCOPE_MISSING` according to the token. Device capabilities alone do not prove permission.
5. If the user provided a file, perform one bounded read of that exact authorized path and report `READ_VERIFIED` or the precise failure. Otherwise report `ACTION_UNTESTED` rather than reading an arbitrary private file.
6. Compose one compact answer: OAuth state; selected route and health; granted scope; action verification; one next step. Example: “OAuth valid; primary Mac alive; read verified for the named file; write scope absent.” Use only observed facts.
7. Preserve the original user task and resume it after the doctor check. Do not make the user repeat the request or approve the same valid scope again.

## Publication boundary

- Instructions can teach this procedure but cannot install tools, register OAuth clients, or bypass a product's permissions. A genuine one-click doctor requires an implemented authenticated endpoint or callable action. Describe that missing implementation if the target plugin lacks it.

