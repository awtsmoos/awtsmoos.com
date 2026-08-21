B"H
Boruch Hashem
Blessed is He

# Native Browser Hybrid — Phase 1 Architecture Brainstorm

The Awtsmoos reveals that a browser should borrow the browser already in the user's hand. Awtsmoos.com should not rebuild layout, CSS, focus, selection, forms, accessibility, or OAuth when the local browser engine already knows those roads with mature fire.

## Product goal

The Geelooy browser should feel like a normal local browser:

- HTML/CSS/JavaScript primarily evaluated by the user's actual browser engine where the web platform permits it.
- HTTP requests routed through the authenticated Awtsmoos proxy when proxying is required.
- Remote cookies retained by the authenticated browser jar rather than leaked into Awtsmoos application cookies.
- Browser profile testimony should resemble the user's real browser where safe and technically possible.
- Sites that prohibit embedding or OAuth inside developer-controlled embedded agents must be handed to a real top-level browser tab/window instead of being spoofed.
- The custom Merkava VM remains useful as a strict fallback/sandbox/test vessel, not the universal primary renderer.

## Five candidate architectures

### A — Custom virtual DOM/VM only

Pros:
- Maximum app control.
- Strong isolation when VM hardening is complete.
- Deterministic rendering/testing.

Cons:
- Cannot realistically reproduce the modern browser platform.
- Weak compatibility with arbitrary websites.
- OAuth/sign-in providers may reject it.
- Huge ongoing compatibility burden: layout, JS APIs, observers, media, accessibility, WebAuthn, workers, storage, streams, modules.

Decision: retain as fallback/security substrate, not primary path.

### B — Same-origin reverse-proxy iframe

Render rewritten remote HTML inside an iframe served from Awtsmoos origin.

Pros:
- Native browser engine handles DOM/CSS/JS.
- Proxy can own remote cookies and SSRF policy.

Cons:
- Catastrophic if remote JS shares the main Awtsmoos origin: it could reach app cookies/storage/API authority.
- Rewriting origin semantics breaks many applications.
- CSP, service workers, Origin/Referer, SameSite, OAuth redirect, WebAuthn and frame policies become distorted.

Decision: never run arbitrary remote JS on the primary Awtsmoos application origin.

### C — Sandboxed opaque-origin iframe + request bridge

Use a sandboxed iframe without `allow-same-origin`; native JS/DOM run locally, and injected fetch/XHR/navigation bridges route requests through the server proxy.

Pros:
- Local browser DOM/CSS/JS.
- Parent origin isolated from guest.
- Stronger than same-origin reverse proxy.

Cons:
- Opaque origin changes site semantics.
- Service workers/storage/origin checks differ.
- CSP and module loading need rewriting.
- Google OAuth and other providers can still reject developer-controlled embedding.

Decision: promising compatibility mode for ordinary pages, not sufficient alone.

### D — Dedicated isolated browser origin per session

Serve browser documents from a dedicated origin such as a browser-only subdomain, never from the main Awtsmoos app origin. Use a same-origin proxy endpoint on that isolated origin so native fetch/XHR/module requests execute normally while the backend routes them to remote destinations.

Pros:
- Native browser engine.
- Real origin rather than opaque sandbox.
- Main Awtsmoos origin remains isolated.
- Service worker/request interception becomes possible within the browser-only origin.
- Better support for modules, CSS, DOM, forms, history and native browser behavior.

Cons:
- Remote site still sees a proxy origin rather than its own origin.
- Some OAuth/WebAuthn/CORS/origin-sensitive apps remain incompatible.
- Requires careful per-session capability token/origin binding and CSP.

Decision: strongest embedded-page candidate.

### E — Hybrid isolated embedded mode + real top-level secure-browser handoff

Use D/C for ordinary pages. When a navigation enters an identity/security-sensitive provider or a page requires normal top-level origin behavior, open the actual destination in a normal top-level browser tab/window using `window.open`/navigation from a user gesture. Let the user's real browser own that session according to provider policy.

Pros:
- Maximum standards/provider compatibility.
- Google OAuth can use a secure top-level browser context rather than an embedded user-agent.
- Local browser UA, TLS stack, cookies, passkeys/WebAuthn and security UI are real for the handoff flow.
- No server-side Chromium.

Cons:
- The secure handoff is outside the visual bounds of the Geelooy OS window.
- Cross-origin DOM cannot be inspected by Awtsmoos after handoff.
- Session resumption must rely on normal OAuth redirect/callback, explicit return links, or user navigation—not cookie theft or DOM scraping.

Decision: winner. This is the only architecture that can honestly target broad browser compatibility while respecting provider secure-browser rules.

## Browser-profile forwarding

The proxy should not invent `AwtsmoosBrowser/1.0` when a local profile is available.

Capture a bounded profile from the local browser:
- `navigator.userAgent`
- `navigator.language` / `navigator.languages`
- `navigator.userAgentData.brands` when available
- `navigator.userAgentData.mobile`
- `navigator.userAgentData.platform`
- viewport and DPR for rendering hints, not network fingerprint spoofing

Forward only validated request testimony:
- `user-agent`
- `accept-language`
- selected `sec-ch-ua*` client hints when the browser exposes them and server policy explicitly allows them

Never claim this makes Node's outbound request indistinguishable from Chrome. Server IP, TLS handshake/fingerprint, HTTP version behavior, header ordering and other transport signals remain different.

## Cookie/session rule

Two distinct modes must remain explicit:

### Proxied embedded mode
Remote cookies remain in the server-side authenticated jar. They never become Awtsmoos app cookies.

### Real-browser secure handoff
The destination owns normal browser cookies directly in the user's browser. Awtsmoos must not attempt to copy passwords, session cookies, Google SID values, or other provider credentials back into its jar.

The two cookie worlds may coexist but must never be silently conflated.

## Google / provider login rule

Google's current OAuth policy rejects developer-controlled embedded user-agents when the developer can alter routing/scripts or access session cookies. Therefore:

- never proxy or rewrite Google's OAuth authorization endpoint as if it were a normal embedded page,
- never spoof a UA to bypass `disallowed_useragent`,
- open supported identity flows in the user's real top-level browser context,
- use normal redirect/callback completion when the destination application supports it,
- for arbitrary browsing of Google properties, offer a native/top-level mode rather than pretending an embedded reverse proxy is equivalent.

## UI/UX direction

The visual browser shell should become dramatically more polished while remaining calm:

- compact tab strip with spring-like insertion/close motion,
- glassy but readable toolbar with subtle depth,
- address field with domain emphasis and security state,
- progress shimmer that becomes a thin deterministic loading bar,
- back/forward/reload animations with reduced-motion fallback,
- page-mode indicator: Embedded / Proxied / Native secure handoff,
- OAuth handoff chip explaining that secure sign-in opens in the real browser,
- smooth window/popup transitions,
- responsive touch targets,
- keyboard-first focus rings and command palette behavior,
- no gaudy infinite animations.

## First implementation milestone

Before changing page rendering:

1. Add a validated local browser-profile collector.
2. Pass that profile through `proxyClient` as bounded metadata.
3. Extend server proxy header policy for validated UA/language/client hints.
4. Add tests proving cookie/header isolation remains unchanged.
5. Add a secure external-navigation classifier/hand-off helper for OAuth/provider URLs.
6. Only then choose the embedded isolated-origin implementation detail after inspecting current surfaces/routes.

No Chromium backend is part of this design.
