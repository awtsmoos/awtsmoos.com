B"H
Boruch Hashem
Blessed is He

# Phase One — Broad Possibility Map

From hidden route to public gate,
the Awtsmoos reveals what contracts state.
At Awtsmoos.com each vessel must show,
where auth begins and tool calls flow.

## Desired external-agent experience

A capable external agent should be able to begin from one stable public URL and mechanically discover everything needed without scraping prose or guessing private endpoints. The ideal flow is: OAuth discovery → authorization → protected-resource discovery → MCP initialization or control discovery → device discovery → action schema → harmless action → durable receipt.

## Failure families to investigate

1. **Discoverability failure** — `robots.txt`, headers, middleware, route exclusions, redirects, content negotiation, or HTML-only documentation may block automated clients.
2. **OAuth metadata failure** — issuer/resource/audience/scopes or endpoint methods may not align with the actual control resource.
3. **PKCE handoff failure** — a generic agent may not understand the custom handoff without a machine-readable recipe or returned links.
4. **Device-flow mismatch** — device authorization may use POST while the control doctrine emphasizes GET; docs and implementation may disagree.
5. **MCP auth challenge failure** — unauthenticated `initialize` must return a useful 401 challenge with protected-resource metadata rather than an opaque 404 or generic page.
6. **MCP transport failure** — content types, JSON-RPC shape, session handling, SSE negotiation, and error semantics may be incompatible with Claude/MCP clients.
7. **Tool discovery failure** — `tools/list`, device discovery, action-schema discovery, and route identity may be incomplete or inconsistently named.
8. **Routing failure** — friendly tunnel names may leak into places that require immutable `routeReference` values.
9. **Documentation/runtime drift** — public prose may claim behavior that machine docs/OpenAPI/runtime do not provide.
10. **Provider-environment failure** — hosted Claude fetchers may obey robots or deny arbitrary network; the Awtsmoos API should maximize standards-based discovery so supported connector surfaces can still work.
11. **Testing blind spot** — tests may validate local handlers while missing public-domain redirects, headers, nginx, or authentication challenge behavior.
12. **Operational observability failure** — external agents may not receive enough receipt/status information to distinguish accepted, pending, failed, or replay-unsafe operations.

## Candidate architectures

### Architecture A — Repair documentation only

Pros: small change surface.
Cons: cannot fix real interoperability if HTTP/MCP behavior is wrong.
Verdict: insufficient unless runtime tests prove API correctness already.

### Architecture B — Repair MCP only

Pros: Claude-native integration path.
Cons: leaves OAuth/docs/control discovery gaps and other agents broken.
Verdict: useful but not broad enough.

### Architecture C — Repair OAuth + MCP + machine discovery as one external-agent contract

Pros: standards-first, generic, testable, Claude-friendly, future-agent-friendly.
Cons: touches several public-contract modules and requires careful compatibility tests.
Verdict: current leading architecture.

### Architecture D — Add a separate Claude-specific adapter service

Pros: can compensate for provider quirks.
Cons: duplicates the universal API and risks permanent divergence.
Verdict: avoid unless a provider-specific incompatibility cannot be solved at the standard layer.

### Architecture E — Add a generated client/CLI on top of the universal contract

Pros: excellent developer experience and local Claude Code support.
Cons: should follow, not replace, a correct public API.
Verdict: possible shadow work after the core contract is verified.

## Phase-one decision

Pursue Architecture C first. Preserve compatibility. Prefer standards-based OAuth protected-resource discovery and Streamable HTTP MCP behavior. Add Claude-specific documentation or helper configuration only after the universal contract passes real HTTP checks.

## Evidence still required before coding

- Exact source files and route registration.
- Existing tests and fixtures.
- Current public HTTP responses including headers.
- Current robots/security behavior.
- Current MCP implementation and transport contract.
- Current OAuth resource binding and token validation.
- Existing OpenAPI/docs generation path.
- Existing release/deploy constraints for these files.
