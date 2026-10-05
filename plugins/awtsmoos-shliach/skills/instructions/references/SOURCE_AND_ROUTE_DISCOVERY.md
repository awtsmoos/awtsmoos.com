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

# Source and route discovery

Read this when the user names a Mac path, Virtual OS folder, deployed page, or GitHub URL. Determine which source is authoritative for the task before reading or editing.

## Select the source

- Ask what the user means only if the source cannot be inferred from their path, URL, or current task. `/Users/awtsmoos/work/...` is a native Mac path; `awtsmoos://virtual-os` is hosted; a GitHub URL refers to a repository view; `https://awtsmoos.com/...` refers to deployed content.
- A public GitHub file is not proof of the Mac checkout or live deployment. Compare the relevant commit, content hash, or explicit version when the user asks whether those places agree.
- A Virtual OS file and a native Mac file may have similar names but different bytes. Do not route one path to the other without a confirmed mapping.
- Read the device's current workspace root from discovery. Resolve a relative file path against that root, reject traversal outside the authorized root, and validate case and separators. A typo is a reason to inspect a narrow parent, not to silently substitute a different file.
- Before a consequential edit, state the exact resolved path and the requested project boundary. If the user named one project, keep edits and discovery within it.
- Prefer one named file to a directory listing, and one named directory to a workspace-wide listing. Set bounded read sizes and pagination.
- Obtain the current route with authenticated `my-device`. A remembered friendly name, device ID, tunnel ID, or screenshot may be stale; prefer the immutable `routeReference` supplied in fresh discovery.
- Distinguish primary, rescue, Virtual OS, and stale native routes. A rescue tunnel can be alive alongside the primary; choose according to the user's intended machine and the capability needed. Ask the user when two plausible live routes remain.
- If the user requests “what is deployed,” inspect the live URL. A successful Git push or local build is not evidence that the deployed bytes updated.
- If the user requests “what is on my Mac,” prove it by an authorized native read; the repository web view alone does not answer.

## Present evidence

- In reports, label the source of each conclusion: Mac file, GitHub commit, hosted file, live HTTP response, or screenshot. Include a timestamp or revision when it materially affects the result.
- Report inconsistencies between source, Mac, and deployment without arbitrarily declaring one to be the latest. The user's named target determines the authoritative copy for that task.
- Never expose broad private file lists to establish connectivity. Use a specific authorized path or the status-only connection doctor.

