B"H
Boruch Hashem
Blessed is He

# Phase Two — Evidence-Led Critique and Improved Architecture

The Awtsmoos is One while transports divide,
Awtsmoos.com must name each vessel and never let contracts collide.
OAuth guards the doorway, MCP carries the deed,
clarity in the machine contract is what Claude and future agents need.

## Observed architecture

- `/api/tunnel/control/mcp` is already mounted through the canonical route table.
- The MCP handler correctly challenges unauthenticated GET and POST before method/body validation.
- OAuth authorization already preserves RFC 8707 `resource` indicators and binds them into code/token/refresh records.
- Dynamic client registration tests already cover the MCP resource audience.
- Root Protected Resource Metadata exists at `/.well-known/oauth-protected-resource`.
- Current MCP SDK guidance also derives a path-aware metadata URL: `/.well-known/oauth-protected-resource/api/tunnel/control/mcp`.
- The `.well-known` router currently mounts only the root protected-resource route.
- The MCP challenge currently points to the root metadata URL.
- Human docs advertise MCP, but `agent-manifest` and `bootstrap` emphasize a GET-only legacy control law and do not expose MCP as a first-class machine-readable transport.
- Claude remote custom connectors are designed to connect directly to a public HTTPS MCP URL and detect OAuth automatically.

## 24 concrete improvements over phase one

1. Preserve the existing root metadata endpoint as a compatibility alias.
2. Add the standards-derived path-aware Protected Resource Metadata endpoint.
3. Change the MCP Bearer challenge to advertise the path-aware metadata URL.
4. Keep the protected resource URI exactly `https://awtsmoos.com/api/tunnel/control/mcp`.
5. Preserve exact audience validation in MCP auth.
6. Preserve `tunnel.read` as the minimum MCP entry scope.
7. Do not create a `claude` OAuth client merely for branding.
8. Keep `external-agent` for the Awtsmoos custom handoff flow.
9. Keep Dynamic Client Registration for generic remote MCP hosts such as Claude.
10. Make MCP a first-class machine-readable section of the bootstrap response.
11. Make MCP a first-class machine-readable section of the agent manifest.
12. Explicitly distinguish legacy GET control transport from Streamable HTTP MCP POST.
13. Publish the exact MCP endpoint in OpenAPI metadata extensions.
14. Publish the exact Protected Resource Metadata URL in OpenAPI metadata extensions.
15. Publish the OAuth authorization-server metadata URL beside the MCP endpoint.
16. Publish the minimal MCP connection sequence without embedding credentials.
17. Keep the MCP contract provider-neutral while adding a Claude-compatible usage hint.
18. Preserve existing Grok and ChatGPT compatibility records.
19. Add focused unit tests for root + path-aware metadata aliases.
20. Update Bearer challenge tests to require the path-aware URL.
21. Add discovery tests proving bootstrap/manifest separate GET control from POST MCP.
22. Add tests proving the MCP endpoint remains stateless and supports current `2026-07-28` discovery.
23. Verify public responses with real HTTPS after source tests; never infer deployment from unit success.
24. Avoid touching the 283-line emergency router unless evidence requires it; the `.well-known` router is the smaller correct boundary.

## Improved architecture

Create one small MCP discovery-contract module beside the existing MCP resource module. It owns only declarative connection metadata: endpoint, transport, methods, metadata URLs, scopes, protocol generations, and connection steps. Existing `bootstrap`, `agentManifest`, and OpenAPI enrichment consume this one source so prose cannot drift.

Rewrite `resource.js` to expose both canonical path-aware and legacy root metadata URLs. Rewrite the `.well-known` router to serve both routes with the same resource document. Rewrite `auth.js` tests through the new canonical challenge. Preserve handler behavior unless direct tests expose another defect.

## Risks deliberately rejected

- No provider-specific token handling.
- No hard-coded Claude secret.
- No bypass of OAuth or scope checks.
- No weakening of exact resource/audience validation.
- No server restart during another session's work.
- No monolithic rewrite of the entire control router.
- No documentation-only fix pretending runtime compatibility is repaired.
