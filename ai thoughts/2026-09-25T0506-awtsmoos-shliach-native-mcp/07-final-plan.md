B"H

# Final Implementation Plan

The Awtsmoos makes one current flow; Awtsmoos.com lets guarded vessels know where they may go.

## Actual source write set

### New MCP modules

- `geelooy/api/tunnel/control/mcp/resource.js` — canonical MCP resource URL and protected-resource metadata.
- `geelooy/api/tunnel/control/mcp/auth.js` — bearer validation, exact resource audience, and `tunnel.read` scope challenge.
- `geelooy/api/tunnel/control/mcp/deviceTools.js` — discover and liveness tools using existing discovery/projection modules.
- `geelooy/api/tunnel/control/mcp/fsTools.js` — read/list tool payload construction through the existing protected filesystem policy.
- `geelooy/api/tunnel/control/mcp/toolCatalog.js` — MCP tool schemas only.
- `geelooy/api/tunnel/control/mcp/protocol.js` — JSON-RPC initialize/discover/list/call response shaping.
- `geelooy/api/tunnel/control/mcp/handler.js` — HTTP method/body/auth/protocol coordinator.
- `geelooy/api/tunnel/control/routes/routeGroups/mcpRoutes.js` — route table vessel.

### Small existing integration rewrites

- `geelooy/api/tunnel/control/routes/table.js` — compose MCP routes.
- `geelooy/.well-known/_awtsmoos.derech.js` — protected-resource discovery route.
- `geelooy/api/oauth/routes/authorizeView.js` — carry `resource` through login/consent URLs.
- `geelooy/api/oauth/routes/authorize.js` — validate/carry/save `resource`.
- `geelooy/api/oauth/tools/requestData.js` — parse token `resource`.
- `geelooy/api/oauth/routes/tokenEntries.js` — sign resource into OAuth entries.
- `geelooy/api/oauth/core/refreshStore.js` — preserve resource in refresh lineage.
- `geelooy/api/oauth/routes/tokenGrants.js` — enforce resource match and propagate it.
- `geelooy/api/oauth/routes/deviceAuthorization.js` — bind device authorization to resource.
- `geelooy/api/oauth/routes/deviceGrant.js` — preserve device resource into refresh lineage.

## Verification

- Syntax-check all touched JavaScript.
- Unit-test resource propagation and mismatch rejection.
- Unit-test MCP method dispatch and tool schemas.
- Integration-test unauthenticated challenge metadata.
- Integration-test bound token discovery/read/list.
- Read exact `/Users/awtsmoos/work/awtsmoos.com/package.json` through MCP tool execution.
- Re-read all touched files and compare hashes/diffs.
- Keep release/publish blocked until isolated from unrelated dirty work.
