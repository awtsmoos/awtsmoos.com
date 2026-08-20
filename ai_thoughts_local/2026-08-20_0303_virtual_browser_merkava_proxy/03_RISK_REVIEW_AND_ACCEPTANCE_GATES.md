B"H
Boruch Hashem
Blessed is He

# Phase 3 — Risk Review and Acceptance Gates

> The Awtsmoos reveals a safer browser not by adding invisible authority, but by measuring every crossing. Awtsmoos.com should let the user's own runtime breathe while the server guards only the roads that truly leave the machine.

## Architecture acceptance rule

A corrected implementation is acceptable only when a normal remote page can load, execute, fetch, navigate, and open a virtual child window **without starting or requiring Chromium on the backend**.

## Guardrails and improvements

1. Preserve offline `VirtualFetch` as the default when no transport is injected.
2. Never let a guest page receive the host application's raw `fetch` function.
3. Never let guest code choose the Drive alias endpoint directly; the host adapter owns alias/jar/project context.
4. Resolve every relative guest URL against the virtual page URL, not the Geelooy host origin.
5. Route every external guest request through the existing Drive proxy.
6. Preserve server-side cookie jars; never synthesize `document.cookie` from server cookie values.
7. Do not return `Set-Cookie` to guest headers.
8. Prevent guest-supplied `Cookie` headers from bypassing jar policy.
9. Preserve cross-origin Authorization stripping already implemented by `ProxyService`.
10. Preserve SSRF/public-address/DNS-pinning policy already implemented server-side.
11. Bound request body size at both client adapter and existing server policy.
12. Start with server-supported GET/HEAD/POST semantics; do not silently emulate unsupported methods as POST.
13. Preserve redirect final URL so virtual `location` and relative resource resolution move to the actual destination.
14. Preserve redirect initiator information for policy/audit testimony.
15. Keep local virtual files higher priority than routed network fetches.
16. Keep `data:` URLs local; never send them to the proxy.
17. Avoid duplicate downloads by caching collected page resources by canonical final URL during one navigation.
18. Bound page-graph file count, total bytes, per-file bytes, and recursive module depth.
19. Reject unsupported binary execution as data rather than decoding arbitrary bytes into text.
20. Use textual MIME/header evidence to decide whether a body enters the script/style source graph.
21. Keep network logs free of request-body secrets by recording sizes/methods/URLs rather than full body content.
22. Keep login input values out of host status strings and console logs.
23. Do not mirror remote password values into the browser application's editor textarea.
24. Keep guest DOM/events isolated inside Merkava objects; remote scripts must not receive the real Geelooy `document` or `window`.
25. Execute guest classic scripts with the existing virtual-global wrapper in the host JS engine, not with direct `<script>` injection into Geelooy DOM.
26. Execute guest ES modules through Merkava transformation/VM semantics, not native `import(remoteUrl)`.
27. Replace `RuntimeAssembler` raw dynamic-module `fetch()` with an injected transport.
28. Keep browser VM module code split into small files rather than making the large Node CommonJS executor dual-environment.
29. Add parity tests between Node `executeVmFiles` and browser-safe VM executor for path resolution/import/export basics.
30. Do not copy simulation-specific Three.js/game shortcuts unless required by parity tests; remote browsing should favor general semantics.
31. Treat `history.pushState` / `replaceState` as same-document URL changes unless an explicit navigation primitive requests a new document.
32. Add explicit host navigation intent for anchors/forms/location assignment where the virtual DOM currently lacks full navigation.
33. Make popup intent explicit and host-mediated; guest code must never call real host `window.open` directly.
34. New Geelooy popup windows should share only jar identity and navigation context, not mutable virtual DOM objects.
35. Give each Geelooy browser window its own client-side Merkava runtime.
36. Preserve back/forward/reload history in host browser controls and synchronize virtual location.
37. Keep local editor/self-host mode separate from remote live-page mode to avoid remote markup becoming editable credential-bearing text.
38. Do not remove Chromium implementation files until no production import/route references remain.
39. Remove Chromium routes before deleting their implementation so stale clients fail closed rather than leaving orphan network authority.
40. After unwind, assert by source scan that production browser paths contain no CDP, remote-debugging, Chrome launcher, profile, screenshot-frame, or target-session references.
41. Run browser integration tests with no Chrome executable available/required on the backend.
42. Keep Node DOM tests as a separate parity surface; do not couple interactive browser startup to tunnel tooling.
43. Preserve every unrelated dirty repository change.
44. Rewrite full files only; no range/partial edits.
45. Keep every touched implementation file at or below 120 lines by extracting narrow modules.
46. Update JSDoc to describe the actual Chrome-free architecture rather than legacy Chromium language.
47. Maintain deterministic tests by injecting fake transports and clocks instead of reaching the public network.
48. Add one integration fixture with classic script + fetch + DOM mutation before testing complex public sites.
49. Add one module fixture with static import + dynamic import before attempting modern application pages.
50. Add one form POST fixture that proves body reaches proxy service while cookie values remain absent from client-visible responses.
51. Add one popup fixture that proves `window.open` creates an OS browser program window without any backend browser target.
52. Treat third-party identity-provider success as provider-dependent; verify mechanics without claiming unsupported credentialed-login guarantees.

## Street 1 acceptance gates — routed VirtualFetch

All must pass before moving to resource collection:

- Existing VirtualFetch offline tests unchanged.
- New injected-transport GET test passes.
- Local-file precedence test passes.
- `data:` URL local behavior passes.
- Relative URL resolves from virtual page URL.
- POST body reaches fake transport exactly once.
- Final URL/status/content type appear in virtual Response semantics.
- Proxy client forwards body without exposing cookie internals.
- No host raw network call occurs in deterministic tests.
- Touched source files pass syntax and line-count checks.

## Street 2 acceptance gates — page graph

- Top-level HTML arrives through proxy.
- External classic scripts are collected through proxy.
- Styles are collected through proxy.
- Static module graph is bounded and collected through proxy.
- Cross-origin resources still route through proxy rather than browser CORS.
- Resource limits fail closed with clear codes.

## Street 3 acceptance gates — browser VM modules

- Browser-safe executor has no Node `require`, `path`, `process`, or filesystem dependency.
- Basic default/named/namespace imports match Node executor semantics.
- Circular import vessel does not infinitely recurse.
- Import maps resolve identically for covered fixtures.
- Dynamic import calls routed resource transport.

## Street 4 acceptance gates — live navigation/popups

- Anchor/form/navigation intent changes page through host coordinator.
- Back/forward/reload remain coherent.
- `window.open()` creates a sibling Geelooy browser window.
- Parent and child share server `jarId` but not virtual DOM objects.
- No backend Chromium/session/target route is contacted.

## Final unwind gate

Only after all four streets pass:

1. Remove production imports of Chromium interactive client modules.
2. Remove interactive Chromium Drive routes.
3. Re-run proxy + Merkava + OS browser tests.
4. Source-scan for stale Chromium/CDP references in production browser path.
5. Then delete now-unreferenced Chromium implementation files in full-file/tree-safe operations.
6. Verify the OS browser still operates when no Chrome process is running on the server.
