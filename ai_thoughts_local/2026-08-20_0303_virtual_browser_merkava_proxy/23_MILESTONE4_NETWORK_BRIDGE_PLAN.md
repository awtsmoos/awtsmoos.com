B"H
Boruch Hashem
Blessed is He

# Milestone 4 — Same-Virtual-Origin Runtime Network Bridge

The Awtsmoos gives the guest a road only where a normal browser could truthfully see;
Awtsmoos.com may carry the packet through its proxy, but never turn that proxy into a CORS oracle of hidden sea.

## Security invariants

- Guest runtime network access is virtual-same-origin only in the first authoritative version.
- Initial request methods: GET, HEAD, POST, matching the existing server proxy policy.
- Initial request body ceiling: 1 MiB, matching the existing server proxy policy.
- Guest cannot set Cookie, Set-Cookie, Host, Origin, Referer, User-Agent, Sec-*, Proxy-*, connection, transfer-length, or transport-control headers.
- Local browser profile remains the authority for User-Agent / Accept-Language testimony.
- Server-side jar remains the authority for remote cookies.
- Duplicate guest request IDs fail closed.
- In-flight guest runtime requests are bounded.
- Initial credentials modes: same-origin/include only. `omit` fails closed until the proxy supports explicit cookie omission.
- Initial redirect mode: follow only. Manual/error modes fail closed until represented truthfully.
- The final proxy response URL is checked again. A cross-origin redirect must not expose its response body to guest JavaScript.
- Runtime cross-origin fetch fails closed until explicit CORS semantics exist.
- XMLHttpRequest, WebSocket, EventSource, service workers, and WebRTC remain separate work nodes; CSP blocks their ambient network paths meanwhile.

## Production files

### `embeddedNetworkRequestPolicy.js`
Pure validation and response shaping:
- request ID validation,
- HTTP(S) same-origin URL check,
- method/body/headers/credentials/redirect bounds,
- base64 body decode,
- final response-origin check,
- safe response payload.

### `embeddedNetworkBridge.js`
Host-owned request lifecycle:
- subscribe to typed `NETWORK_REQUEST`,
- reject duplicate/in-flight overflow,
- validate through request policy,
- call injected existing proxy transport,
- send typed `NETWORK_RESPONSE` / `NETWORK_ERROR`,
- ignore late responses after destroy.

### `embeddedGuestNetworkSource.js`
Readable generated guest code:
- override `fetch` before page scripts execute,
- create real Request objects after resolving virtual relative URLs,
- serialize body bytes safely,
- send typed network request through parent channel,
- reconstruct real Response objects,
- reject host errors as fetch-like TypeErrors,
- timeout stale pending requests.

### `embeddedGuestBootstrap.js`
Full rewrite only:
- compose markup source,
- compose navigation source,
- compose network source,
- route validated parent responses into network resolver,
- preserve render/reset/error/ready flow.

## Verification

After all code is written:
1. line-count gate,
2. syntax gate,
3. policy tests,
4. host bridge tests,
5. generated guest fetch source tests,
6. combined Milestone 4 tests,
7. rerun Milestone 3 26/26 containment,
8. rerun Milestone 1 and Milestone 2 regressions,
9. broader non-Chromium proxy/security regression.

## Explicit compatibility debt

This milestone does not claim arbitrary browser network parity. It establishes a secure, browser-shaped same-origin `fetch()` road first. Cross-origin CORS, XHR, sockets, streams, service workers, credential omission, custom headers, and manual redirects remain visible REMAINING_WORK rather than hidden approximation.
