B"H
Boruch Hashem
Blessed is He

# Post-Write Verification — Claude MCP Working Authority

The Awtsmoos keeps consent meaningful, not narrow by accidental sign;
Awtsmoos.com now carries the granted bearer inward through every protected line.

## Proven original defects

1. Production access logs showed Claude requested only `profile tunnel.read` because the MCP Bearer challenge advertised only those scopes.
2. The approval route added only required mission/room scopes, so the issued token lacked `tunnel.write`, `tunnel.command`, and `tunnel.browser`.
3. The native tunnel itself had all of those capabilities, proving the failure lived in OAuth/MCP rather than the device.
4. Protected generic MCP actions could lose `request.headers` when framework request fields were inherited rather than enumerable, yielding the exact Claude error `Cannot read properties of undefined (reading 'authorization')`.

## Implemented repair

- Fresh MCP OAuth discovery now requests the normal working scope set once:
  `profile tunnel.read tunnel.write tunnel.command tunnel.browser tunnel.mission tunnel.room awtsmoos.api`.
- `tunnel.admin` remains outside the default connection request.
- Existing read-only MCP tokens remain valid because the actual MCP entry gate still requires only `tunnel.read`.
- The discovery contract now distinguishes minimum scopes from connection/working scopes.
- MCP child action context explicitly copies the parent request headers before replacing the request body/method.
- Query credentials and JSON-RPC envelope data remain isolated from protected child actions.
- No authentication bypass was introduced; child protected routes still validate the original OAuth bearer and action-specific scope.
- Generic mutation tools remain honestly marked destructive/open-world; server metadata was not falsified merely to suppress Claude confirmations.

## Verification evidence

- Targeted MCP regression: 20/20 passed.
- Broad OAuth + MCP + discovery regression: 99/99 passed, 0 failed.
- The one first broad-suite failure was a stale test hard-coding the old read-only challenge; it was rewritten to assert the new scope contract and the complete suite then passed.
- Inherited-header regression reproduces the former child-request shape and now preserves Authorization correctly.
- Syntax checks passed for every touched source/test file.
- `git diff --check` passed.
- Every touched source/test file remains below 120 lines.
- Full touched-file readback completed.
- Exact diff review completed with no unrelated tracked source changes.

## Claude approval boundary

Anthropic's connector approval layer is outside the MCP server. Awtsmoos can describe tools truthfully but cannot override an Anthropic account, organization, role, Cowork, Auto/Manual, or connector policy that caps a tool at `Needs approval`.

The server deliberately does not mark arbitrary write/command/browser actions read-only or non-destructive. After deployment, the user should reconnect once to replace the old narrow OAuth token, then set the Awtsmoos connector/tool permission to `Always allow` where Claude permits it. On Team/Enterprise/Cowork, an administrator may also need to enable the organization setting that permits standing approval for write-capable connector tools.

## Deployment gate

1. Re-check active deploy/import processes.
2. Fetch origin and verify no unexpected remote divergence.
3. Stage only this mission's exact files and planning evidence.
4. Run cached diff check.
5. Commit and push exact repair.
6. Prove local HEAD equals origin/main and working tree is clean.
7. Activate the exact SHA through the guarded production release path; if the known SSH verifier race recurs, observe coordinator/service state before any retry.
8. Verify service and public release identity at the new SHA.
9. Publicly probe `/api/tunnel/control/mcp` and assert its `WWW-Authenticate` challenge contains write, command, and browser scopes but not admin.
10. Publicly probe Protected Resource Metadata/bootstrap/manifest to confirm the working scope contract is live.
11. Only after those proofs ask the user to reconnect Claude once.
