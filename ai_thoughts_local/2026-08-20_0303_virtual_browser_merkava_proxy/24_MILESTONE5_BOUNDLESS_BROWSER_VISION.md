B"H
Boruch Hashem
Blessed is He

# Milestone 5 — Boundless Browser Vision

The Awtsmoos renews every visible pixel in the Geelooy world;
Awtsmoos.com should therefore reveal a browser that feels native, calm, swift, secure, and unfurled.

## Product north star

Awtsmoos Browser is a full application inside Geelooy OS, not an editor demo and not a backend-Chromium viewer.

The ideal experience contains:

- a real multi-tab browser shell,
- a dominant omnibox,
- back / forward / reload controls,
- trustworthy host-owned security and execution badges,
- smooth loading progress,
- a page viewport rendered by the user's own browser engine,
- native Google/OAuth handoff where provider policy requires a top-level browser,
- proxy-backed same-origin runtime networking,
- host-owned cookie jar/session state,
- a collapsible advanced drawer for alias, jar, Merkava, diagnostics, and self-host tools,
- keyboard-first navigation,
- accessible focus states,
- restrained futuristic animation,
- responsive narrow-window behavior,
- reduced-motion support,
- explicit loading, error, native-handoff, local-render, and fallback states.

## Interaction vision

### Tabs

Tabs feel lightweight and alive rather than ornamental.

Each tab eventually owns:

- title,
- favicon or generated monogram,
- current URL,
- history position,
- loading state,
- execution mode,
- page/session controller.

Milestone 5 begins with one real active tab plus a structural new-tab affordance. Multi-tab state itself remains a later node so the visual shell does not pretend tab isolation exists before it does.

### Omnibox

The omnibox is the primary command surface.

It accepts:

- absolute URLs,
- hostnames without schemes,
- search-like text when a future search provider is configured,
- native provider-sensitive auth URLs.

The host—not guest content—owns its trust icon, execution-mode badge, and progress state.

### Viewport

The page viewport dominates the application.

Ordinary pages render through the opaque embedded local-browser frame. The old Merkava canvas renderer remains available only as an advanced developer surface during migration.

### Advanced drawer

The drawer contains controls that are powerful but should not define ordinary browsing:

- alias,
- jar identifier,
- clear jar,
- current project/session testimony,
- Merkava markup editor,
- render/self-host controls,
- depth,
- metrics,
- runtime diagnostics.

## Visual direction

The UI should feel futuristic without becoming noisy:

- subtle glass surfaces,
- layered depth,
- low-amplitude transforms,
- short opacity transitions,
- animated loading line,
- soft focus rings,
- compact rounded controls,
- dark shell around a neutral page viewport,
- host chrome visually separated from guest content.

## Architectural truth

The UI must reflect the actual runtime architecture:

1. Host browser chrome is trusted.
2. Guest page is opaque/sandboxed.
3. Guest runtime fetch crosses the typed host bridge.
4. Proxy owns cookies and browser-profile testimony.
5. Browser navigation policy selects embedded/native/fallback mode.
6. Google/OAuth handoff uses the genuine top-level local browser where required.
7. Backend Chromium must stop being the default ordinary-navigation authority.

## Boundless future branches

Possible later evolution includes:

- true multiple tabs,
- tab groups,
- session restore,
- downloads mediated by the host,
- permissions UI,
- history/bookmarks,
- find-in-page,
- page zoom,
- reader mode,
- picture-in-picture mediation,
- WebAuthn-aware secure handoff,
- cross-origin CORS-faithful runtime fetching,
- XMLHttpRequest/EventSource/WebSocket bridges,
- site isolation pools,
- extension-like Geelooy browser apps,
- command palette integration with the wider virtual OS.

These remain future nodes, not claims of current support.
