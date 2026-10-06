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

# Identity, path, and change gates

Use these gates before reading private files, switching tunnels, or rewriting source. They refine the existing route and code instructions; they do not broaden permission.

## Identity and consent

- Compare the OAuth account returned by authenticated discovery with the account the user intends. A browser login and a client OAuth grant can belong to different accounts.
- Before private file access, report the connected account in a minimal form if the API exposes a safe profile. Do not expose a full identifier or private metadata without need.
- Before requesting extra scope, explain the exact new operation and why read access is insufficient. Keep the original read connection usable when supported; never silently enlarge it.
- Provide a first-party disconnect or revocation path when asked, then verify the current client no longer has access. Distinguish expired access tokens from revoked consent and refresh failure.
- A rescue route is a distinct device route. Explain a switch from primary to rescue and what operations remain available; never inherit an unfinished task onto it silently.

## Narrow path resolution

- Determine whether a named path is a file, directory, or missing item with the least revealing supported operation. Do not scan the whole workspace for a typo.
- Resolve a symlink only through a supported scoped API and confirm the final target remains inside the authorized project before following it.
- Retain the exact file identity or hash during long planning. Recheck immediately before an edit; if it changed, reread and reconcile with the newer content.
- Page large reads and directory results using documented offsets and limits. Stop once the requested information is found. Keep a safe resume offset when disconnected.
- Return metadata, a hash, or a bounded excerpt when that answers the question; avoid unnecessary full-content disclosure.
- Check target identity both before and after a long or multi-step operation so a path or route change cannot silently redirect work.

## Multi-file edit transaction

- Record the original hash or revision for each touched file. Check again immediately before writing; do not overwrite a changed file without reconciliation.
- Write in dependency order when the system lacks atomic transactions. Record which writes succeeded, then report a partial result precisely if another write fails.
- After a whole-file rewrite, verify every externally consumed export, route, and user-visible behavior. Read each touched file back.
- Edit human-authored source rather than a generated bundle when a source exists. Rebuild generated artifacts through the project workflow.
- Use a revision-specific rollback path for risky migrations, and verify that old data can actually be recovered. A theoretical undo is not proof.

