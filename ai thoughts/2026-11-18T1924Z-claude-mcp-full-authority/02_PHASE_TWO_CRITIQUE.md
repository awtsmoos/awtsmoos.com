B"H
Boruch Hashem
Blessed is He

# Phase Two — Critique and Safer Architecture

The Awtsmoos is one while permissions divide,
Awtsmoos.com must grant enough for work yet keep every boundary alive.

## Critique of naive fixes

- Merely adding `tunnel.command` would leave file writes and browser actions broken.
- Merely fixing `request.headers` would stop the crash but still leave read-only OAuth authority.
- Marking `awtsmoos_tunnel_action` non-destructive would be dishonest because it can delete files and run arbitrary commands.
- Auto-approving inside Awtsmoos cannot suppress Anthropic's own connector approval policy; that UI layer is outside this server.
- Giving `tunnel.admin` by default is broader than ordinary coding requires and should remain opt-in.
- Adding provider-specific Claude bypasses would fragment the universal MCP contract.

## Improved architecture

### OAuth connection authority

Create a dedicated MCP connection scope constant derived from the shared scope catalog, containing profile + read/write/command/browser/mission/room + application API. Use it in the RFC 6750 `scope` challenge and MCP discovery contract. Keep the actual authorization gate requiring only `tunnel.read`, so existing narrower tokens remain valid for read-only MCP.

### Trusted identity propagation

Create an internal symbol-backed trusted identity carrier shared by MCP child contexts and core auth. The outer MCP bearer is already cryptographically verified and resource-bound; child protected routes should consume that frozen identity directly. Do not accept trusted identity from JSON/query/body. Also preserve request headers defensively for compatibility.

### Tool UX

Add dedicated direct tools for common mutation classes:
- exact file write
- command execution
- browser action

Keep their annotations truthful. Read/list/status/schema remain read-only. The generic tunnel action remains available for rare/advanced operations and stays destructive/open-world. This reduces needless use of the generic high-risk surface while preserving capability.

### Approval reality

Claude's own Permissions page remains the authority for persistent `Always allow`. If a user's plan/org forces `Needs approval`, Awtsmoos cannot override it. The server should make tool categories stable and clear so Claude can persist per-tool choices when the product allows it.

## Required tests

- Bearer challenge advertises all normal working scopes.
- Read-only tokens still authenticate MCP.
- Child protected route receives the verified outer identity even if child request headers are absent.
- Direct write tool requires write scope and succeeds with it.
- Direct command tool requires command scope and succeeds with it.
- Generic tool remains marked destructive.
- Dedicated tools have stable names and correct annotations.
