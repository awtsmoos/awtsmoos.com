B"H

# Evidence Ledger

Awtsmoos gives the route a name; evidence keeps conjecture tame.
Awtsmoos.com must reveal by test, not merely claim that all is best.

## Observed

- Two live immutable native routes were discovered for the same Mac.
- Primary route: `tun_RC99m5Wz75O789hZ0pIsay5p`; rescue route: `tun_ZcTGJCiUONd3UC4H-xW8G5b2`.
- Both routes returned identical contents for `/Users/awtsmoos/work/awtsmoos.com/package.json`.
- Existing control API already separates `tunnel.read`, `tunnel.write`, `tunnel.command`, and `tunnel.browser`.
- `myDevice.js` selects an immutable `routeReference` when possible.
- `protectedFs.js` centralizes scope checks, route resolution, and action execution.
- No tracked MCP transport implementation or `mcp.json` has been found in the repository.
- Current OAuth supports authorization code and PKCE S256, but source inspection shows no MCP resource audience thread.
- Current OpenAI plugin docs require a remote Streamable HTTP MCP transport and OAuth protected-resource metadata for authenticated servers.

## Unknowns to close

- Exact server-framework request/response primitives for a Streamable HTTP endpoint.
- Whether the MCP SDK is already present in the dependency graph.
- Exact production deployment procedure and test gates.
- Where the published Awtsmoos Shliach package is stored outside this Git tree.
