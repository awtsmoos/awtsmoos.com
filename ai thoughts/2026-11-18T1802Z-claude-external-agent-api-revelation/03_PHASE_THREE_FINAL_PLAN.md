B"H
Boruch Hashem
Blessed is He

# Phase Three — Final Exact Implementation Plan

The Awtsmoos creates each request anew,
so every route must tell the machine what is faithful and true.
Awtsmoos.com needs no vendor-bound disguise;
one guarded MCP covenant can serve every agent that arrives.

## Thirty final refinements

1. Use standards-derived path-aware metadata as canonical MCP discovery.
2. Retain the root metadata URI as a legacy alias.
3. Keep the actual MCP resource URI unchanged.
4. Keep `authorization_servers` rooted at `https://awtsmoos.com`.
5. Keep Bearer header authentication only.
6. Keep exact resource audience enforcement.
7. Keep `tunnel.read` minimum scope enforcement.
8. Keep current OAuth authorization-code PKCE support.
9. Keep device flow available to non-MCP headless agents.
10. Keep Dynamic Client Registration discoverable for MCP hosts.
11. Do not claim Claude must use `client_id=external-agent` when Claude's MCP host registers its own OAuth client.
12. Explain `external-agent` as the universal Awtsmoos handoff client, not the only MCP OAuth identity.
13. Add an explicit `mcp` object to bootstrap.
14. Add an explicit `mcp` object to agent manifest.
15. Label legacy connector transport separately from MCP transport.
16. State MCP method POST explicitly.
17. State unauthenticated GET/POST may both produce OAuth challenge.
18. State endpoint HTTPS URL explicitly.
19. State path-aware Protected Resource Metadata URL explicitly.
20. State Authorization Server Metadata URL explicitly.
21. State protocol versions without importing the entire protocol dispatcher into documentation code.
22. State the first MCP tool sequence: discover → list → device → schema/action.
23. Add OpenAPI `x-awtsmoos-mcp-*` fields for machine consumers.
24. Preserve all existing OpenAPI path content.
25. Do not touch emergency `_awtsmoos.derech.js` under control.
26. Keep every newly created code module below 120 lines.
27. Rewrite every modified file in full with tabs and B"H/Awtsmoos JSDoc.
28. Add narrow tests rather than relying on broad snapshots.
29. Run syntax and focused node tests before broader tests.
30. After implementation, re-read every changed file, inspect git diff, and run real public HTTP checks if deployment can be proven without disrupting other sessions.

## Exact source files to create

### `geelooy/api/tunnel/control/mcp/discoveryContract.js`

New small declarative module. Exports a frozen/constructed machine contract containing endpoint, Streamable HTTP transport, POST method, OAuth metadata URLs, required scopes, supported protocol versions, and connection sequence. No token state and no side effects.

### `geelooy/api/tunnel/control/mcp/resourceDiscovery.test.cjs`

New focused tests for canonical path-aware metadata URL, legacy root alias, resource document invariants, and MCP discovery contract.

### `geelooy/api/tunnel/control/test/remoteMcpDiscovery.test.cjs`

New machine-discovery regression test proving manifest/bootstrap/OpenAPI advertise remote MCP separately from GET-only legacy control and remain provider-neutral/Claude-compatible.

## Exact source files to rewrite completely

### `geelooy/api/tunnel/control/mcp/resource.js`

Add canonical `/.well-known/oauth-protected-resource/api/tunnel/control/mcp`, retain legacy root alias, preserve metadata body and resource identity.

### `geelooy/.well-known/_awtsmoos.derech.js`

Mount authorization-server metadata, root protected-resource compatibility metadata, and exact path-aware MCP protected-resource metadata. Same document from both aliases.

### `geelooy/api/tunnel/control/mcp/bearerChallenge.test.cjs`

Require challenge to advertise the canonical path-aware metadata URL while preserving RFC 6750 comma-delimited grammar and injection tests.

### `geelooy/api/tunnel/control/routes/agentManifest.js`

Import the MCP discovery contract, add first-class `mcp`, keep existing public keys, and clarify that `transportLaw` describes the legacy direct-control connector. Bump manifest version only if contract meaning materially changes.

### `geelooy/api/tunnel/control/routes/bootstrap.js`

Import MCP discovery contract, include it in bootstrap response, preserve current ChatGPT compatibility behavior, and clarify legacy GET-only instructions do not apply to Streamable HTTP MCP.

### `geelooy/api/tunnel/control/routes/openApiAgentMetadata.js`

Rewrite cleanly with tabs and readable helper functions; preserve all current metadata while adding MCP endpoint, protected-resource metadata, and authorization-server discovery extensions.

## Files explicitly not planned for modification

- `mcp/handler.js`: current challenge-before-method and POST-only authenticated behavior is correct unless tests fail.
- `mcp/auth.js`: consumes `Resource.PROTECTED_RESOURCE_METADATA`; changing the resource constant updates the challenge without weakening auth.
- `mcp/protocol.js`: current 2026-07-28 stateless discovery exists; avoid touching its 145-line implementation unless verification reveals a defect.
- OAuth grant/token files: resource indicators are already propagated and tested.
- Control emergency router: MCP route is already mounted through the canonical table.

## Verification graph

1. `node --check` every changed `.js`/`.cjs` file.
2. Run MCP bearer/resource/discovery focused tests.
3. Run OAuth metadata/dynamic registration/universal-agent tests.
4. Run existing Grok discovery test to prove compatibility.
5. Run all MCP tests if focused suite passes.
6. Inspect `git diff --check` and tab/line-count constraints.
7. Read every changed file in full.
8. Validate public endpoint behavior only after determining whether source is live-mounted or requires deploy.
9. Do not restart or run destructive deploy scripts without coordination.
10. Record planned-vs-actual delta and remaining risk.
