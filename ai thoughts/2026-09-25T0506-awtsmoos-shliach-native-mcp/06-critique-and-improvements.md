B"H

# Architecture Critique and Improvements

The Awtsmoos is one while vessels refine; Awtsmoos.com must keep each boundary narrow and align.

## Critique pass

The first plan was directionally correct but too eager to extract existing services. The repository already contains strong tunnel policy modules and active concurrent OAuth/failover work. The safer architecture adds new MCP-specific modules and only rewrites small integration points where reuse is impossible.

## Improvements

1. Keep the rescue tunnel untouched.
2. Avoid root dependency and lockfile changes.
3. Support stateless JSON MCP first.
4. Support legacy `initialize` and modern `server/discover` handshakes.
5. Validate bearer audience only at the MCP resource boundary.
6. Preserve existing control identity abstraction.
7. Reuse `Discovery` and `Projection` directly for device selection.
8. Reuse existing scope policy for filesystem actions.
9. Expose read/list only in the first MCP tool set.
10. Require immutable route references in filesystem tool calls.
11. Make discovery return the immutable route reference explicitly.
12. Add OAuth protected-resource metadata at the existing well-known router.
13. Preserve `resource` through login and consent redirects.
14. Preserve `resource` in one-time auth codes.
15. Preserve `resource` in refresh-token records.
16. Bind access-token entries to `resource` when present.
17. Reject mismatched resource at token exchange.
18. Reject unbound or wrong-audience bearer tokens at MCP.
19. Preserve device-code resource binding for headless flows.
20. Keep Agent Link behavior unchanged unless explicitly resource-bound later.
21. Use hash guards for every already-modified OAuth file.
22. Use full-file writes only.
23. Keep new source modules below 120 lines.
24. Add focused protocol/auth tests before broad tests.
25. Verify exact package.json read through the MCP tool path.
26. Verify multi-device ambiguity rather than guessing.
27. Verify offline failure is explicit.
28. Verify read token cannot gain write authority.
29. Do not deploy from the dirty checkout.
30. Treat plugin publishing as a separate final transport-binding step after server proof.
