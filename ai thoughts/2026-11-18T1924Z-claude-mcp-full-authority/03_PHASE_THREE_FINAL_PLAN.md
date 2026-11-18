B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Exact File Plan

The Awtsmoos grants one truthful covenant for the work the user has allowed,
Awtsmoos.com carries that authority inward without making every child route ask the cloud.

## Exact files to create

### `geelooy/api/tunnel/control/mcp/trustedIdentity.js`
Internal symbol-based carrier for already-verified MCP identity. Exposes attach/read helpers only. No user payload can populate the symbol.

### `geelooy/api/tunnel/control/mcp/directMutationTools.js`
Small handlers for stable direct write, command, and browser tools. They route through the existing protected action boundary, preserving every existing permission check and receipt contract.

### Focused tests
- trusted MCP identity survives child route context even with absent child authorization header.
- direct tool catalog names/annotations stay stable.
- connection scope challenge contains write/command/browser.

## Exact files to rewrite completely

### `mcp/resource.js`
Replace read-only challenge scope with a clearly named MCP connection scope set derived from shared tunnel scope constants. Preserve resource URI and metadata aliases.

### `mcp/discoveryContract.js`
Advertise the same requested connection scopes so docs and challenge cannot drift.

### `mcp/auth.js`
Continue accepting any token with `tunnel.read`, but advertise full connection scopes in the challenge.

### `mcp/actionContext.js`
Accept a verified identity argument, attach it through the internal symbol, defensively clone request headers, and keep payload isolation unchanged.

### `mcp/genericTools.js`
Pass the already-verified identity into every protected child-route invocation.

### `core/auth.js`
Check the internal trusted MCP identity before reparsing OAuth/session/API-key carriers. Keep all existing external auth paths intact. Split if necessary to remain under the source line ceiling.

### `mcp/extendedCatalog.js` / `toolCatalog.js` / `protocol.js`
Expose direct write/command/browser tool definitions and handlers with truthful annotations. Keep generic action as destructive escape hatch.

## Scope contract

Default MCP connection request:
`profile tunnel.read tunnel.write tunnel.command tunnel.browser tunnel.mission tunnel.room awtsmoos.api`

Not default:
`tunnel.admin`, `tunnel.shell`, `tunnel.preview`.

## Verification sequence

1. Syntax check every touched file.
2. Enforce <=120 lines and tab indentation on touched source/tests.
3. Run `git diff --check`.
4. Run MCP auth/action-context/direct-tool tests.
5. Run the full OAuth + MCP suite.
6. Simulate a read-only token to prove backward-compatible read MCP access.
7. Simulate full working token and prove write + command protected routes receive authority without header crashes.
8. Re-read every touched file and exact diff.
9. Commit/push exact paths only.
10. Deploy exact SHA and verify production challenge now requests write/command/browser.
11. Verify a fresh OAuth authorization request generated from MCP contains the full scope set.
12. User reconnects Claude once so the old narrow token is replaced.
13. User sets Claude connector Permissions to `Always allow` where Claude permits it; server cannot override a stricter Anthropic/org policy.
