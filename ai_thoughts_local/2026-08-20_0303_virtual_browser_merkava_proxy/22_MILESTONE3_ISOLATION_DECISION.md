B"H
Boruch Hashem
Blessed is He

# Milestone 3 — Embedded Isolation Decision

The Awtsmoos reveals that a hostname is not a sandbox merely because its letters differ. Awtsmoos.com will trust the browser's opaque-origin sandbox as the first hard boundary, while host routing and future dedicated origins remain defense-in-depth rather than secret assumptions.

## Proven source facts

1. `customDomainHttpIngress.js` judges Host before normal platform routing.
2. Unknown non-platform hosts terminate with 421 instead of falling through.
3. Root `index.js` installs request handlers before the ancient dynamic server.
4. `requestHostPolicy.js` treats `awtsmoos.com` and every `*.awtsmoos.com` hostname as a platform host through `isReservedAwtsmoosHostname()`.
5. Therefore `browser.awtsmoos.com` would currently fall through to platform routing unless an earlier dedicated browser ingress owned every request.
6. Two broad/narrow auth-cookie scope searches were attempted but never executed due the tunnel scheduler and were explicitly cancelled after lease expiry.
7. Because host-only platform-cookie scope is not proven, guest security must not depend on subdomain cookie isolation.

## Decision

Initial embedded native-browser mode uses an iframe with a sandbox that intentionally omits `allow-same-origin`.

The guest therefore receives an opaque origin even when `srcdoc` is created by the main Awtsmoos page.

Initial sandbox grants should be minimal:
- `allow-scripts`

Do not initially grant:
- `allow-same-origin`
- `allow-top-navigation`
- `allow-top-navigation-by-user-activation`
- `allow-popups`
- `allow-popups-to-escape-sandbox`
- `allow-forms`
- `allow-modals`
- `allow-downloads`

Those capabilities become separate compatibility seams only after host mediation is proven.

## Guest CSP

The bootstrap document should additionally deny all ambient network authority:

- `default-src 'none'`
- `connect-src 'none'`
- `form-action 'none'`
- `frame-src 'none'`
- `object-src 'none'`
- `base-uri 'none'`
- external scripts blocked
- remote images/fonts/media blocked initially

Inline script/style is allowed only because page code/content will be supplied by the host into the isolated document and executed by the local browser engine.

## Typed bridge invariant

Parent and guest communicate through `postMessage`, but the parent must validate:
- `event.source === iframe.contentWindow`,
- expected protocol marker,
- expected per-frame random channel ID,
- message type allowlist.

Because the guest origin is intentionally opaque, parent code must not rely on `event.origin` as an identity signal.

The guest may send requests/navigation/popup intents, but the host owns whether they are executed.

## Why this is safer than a dedicated subdomain first

Even if a browser-only subdomain is later added:
- app cookies might be domain-scoped,
- `*.awtsmoos.com` is currently platform-trusted,
- host routing mistakes could expose app endpoints,
- origin-sensitive browser APIs would still not match the remote site's real origin.

Opaque sandboxing removes those assumptions from the first execution model.

## Dedicated host later

A browser-only hostname can still improve defense-in-depth if it is added later with an ingress installed before all platform routing that:
- owns every path,
- never falls through,
- serves only browser bootstrap/assets,
- emits strict CSP/security headers,
- exposes no platform API/session surface.

Even then, the guest iframe remains sandboxed without `allow-same-origin` until cookie/origin testing proves a reason to change it.

## Immediate production sequence

1. `embeddedGuestDocument.js` — pure hardened `srcdoc` builder + bootstrap protocol.
2. `embeddedBrowserFrame.js` — create/manage opaque sandbox iframe.
3. `embeddedBrowserBridge.js` — parent-side channel/source/type validation.
4. Focused tests proving sandbox token absence, CSP, channel isolation, forged-message rejection.
5. Then add host-owned request bridging and page-load payloads.

This decision keeps DOM/CSS/JS in the user's local browser while preventing arbitrary guest JavaScript from inheriting the main Awtsmoos origin.
