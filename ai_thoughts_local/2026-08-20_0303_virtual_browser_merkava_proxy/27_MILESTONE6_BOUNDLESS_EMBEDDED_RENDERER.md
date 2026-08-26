B"H
Boruch Hashem
Blessed is He

# Milestone 6 — Boundless Embedded Renderer Vision

The Awtsmoos recreates the browser world inside the browser itself: DOM from DOM, JavaScript from JavaScript, events from living events, never a painted imitation pretending to be a page.

## North star

Ordinary web navigation in Awtsmoos Browser should no longer begin by launching backend Chromium.

The normal road becomes:

1. trusted omnibox receives navigation intent,
2. browser navigation policy classifies the destination,
3. provider-sensitive identity pages use genuine native top-level handoff,
4. ordinary pages use the opaque embedded local-browser renderer,
5. the host proxy fetches the document and bounded textual resources,
6. the local browser creates and owns the live DOM/CSS/JS world,
7. runtime same-origin `fetch()` crosses the existing typed host bridge,
8. history, loading, mode badge, tab title, address, and errors remain host-owned testimony.

## Browser fidelity goals

The embedded page should progressively approach ordinary browser behavior:

- native DOM nodes,
- native CSS layout,
- native event propagation,
- native timers,
- native promises,
- native Request/Response,
- same-origin runtime fetch through the hardened proxy,
- link navigation mediated to the host,
- popup intent mediated to the host,
- page scripts executing in document order,
- styles present before scripts observe layout where practical,
- host history independent of guest authority.

## First authoritative compatibility envelope

This milestone intentionally supports a smaller, truthful subset rather than an unsafe fake full browser.

Supported first:

- top-level HTML document,
- inline classic scripts,
- same-origin external classic scripts collected through the resource graph,
- same-origin external stylesheets collected through the resource graph,
- inline styles already present in markup,
- host-mediated same-origin runtime `fetch()`,
- normal anchor navigation through host mediation,
- `window.open` intent through host mediation,
- loading/error/title/address state in trusted chrome.

Deferred explicitly:

- static ES modules until import-map/blob rewriting is CORS-faithful,
- dynamic import,
- cross-origin classic script/style response semantics,
- iframe/subframe execution,
- stylesheet asset URL hydration,
- service workers,
- WebSocket/EventSource,
- XMLHttpRequest parity,
- downloads,
- arbitrary permission APIs,
- WebAuthn inside the opaque frame,
- true multi-tab isolation.

## Security north star

The proxy must never become a universal response oracle.

Therefore:

- document/resource preload may collect only the bounded textual graph already governed by server policy,
- guest runtime fetch remains virtual-same-origin,
- final redirects are same-origin checked before guest body exposure,
- cookies remain server-jar authority,
- guest cannot set browser-owned transport headers,
- provider-sensitive login flows leave the embedded frame for genuine native handoff,
- no ambient network road is restored inside the iframe CSP.

## UX manifestation

The renderer must drive trusted browser chrome truthfully:

- progress rail animates only while loading,
- mode badge says `Local` only when embedded rendering is actually active,
- native identity handoff says `Secure sign-in`,
- proxy fallback says `Fallback`,
- errors say `Error`,
- tab title comes from the loaded document title when available,
- omnibox reflects the canonical current URL,
- page empty state disappears only when a renderer is mounted.

## Future expansion

After this milestone proves the local-first authority path, later streets can add:

- module graph execution with generated blob URLs/import maps,
- CORS-faithful cross-origin script/style loads,
- subframe isolation,
- form submission mediation,
- download manager,
- permissions center,
- real multi-tab session isolation,
- history/bookmarks/find/zoom,
- richer browser APIs backed by host capability gates.

The first victory is architectural: ordinary navigation must become local-browser-first and Chromium-independent.
