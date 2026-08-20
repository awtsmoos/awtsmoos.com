B"H
Boruch Hashem
Blessed is He

# Final Execution Plan — Street 1 Only

> The Awtsmoos gives the virtual browser one guarded bridge to the public road. Awtsmoos.com will not move the city while proving the bridge: local files remain local, guest JavaScript remains Merkava, and only outbound bytes cross the authenticated proxy.

## Goal

Make Merkava `window.fetch()` capable of reaching remote URLs through an injected host transport while preserving the existing offline default and server-side cookie/security boundary.

## Files to read immediately before writing

1. `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualFetch.js`
2. `geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-browser/VirtualWindowCore.js`
3. `geelooy/os/programs/awtsmoos-browser/proxyClient.js`
4. Existing tests that exercise `VirtualFetch` and browser proxy client.

## Production files to touch in Street 1

### A. Rewrite `VirtualFetch.js`

Required behavior:
- Preserve current data-URL handling.
- Preserve current virtual-file candidate/suffix resolution.
- Preserve current graph request/response testimony.
- Accept optional `transport` callback from constructor options.
- Invoke transport only after local resolution misses.
- Normalize request method/headers/body without using the host's ambient network.
- Convert transport result into existing virtual Response semantics.
- Preserve binary response bytes where possible rather than forcing all bodies through Unicode text.
- If no transport exists, return the same virtual 404 behavior as today.

Potential split if line limit requires it:
- New `VirtualFetchRequest.js` for Fetch-like request normalization.
- New `VirtualFetchResponse.js` only if helper growth would push existing files beyond 120 lines.

### B. Rewrite `VirtualWindowCore.js`

Required behavior:
- Pass `options.fetchTransport || options.networkTransport` into `VirtualFetch`.
- Make no other semantic change in this street.
- Do not add popup/navigation code yet.

### C. Rewrite `proxyClient.js`

Required behavior:
- Preserve current endpoint construction, same-origin credentials, error mapping, and jar clearing.
- Add `body` and `bodyBase64` fields when provided.
- Never forward raw Cookie headers from client-controlled headers.
- Never surface server cookie values.

### D. Add `merkavaProxyTransport.js`

Responsibilities:
- Host-owned alias/jar/project context.
- Resolve guest relative URL against provided virtual page URL.
- Convert Fetch-like method/headers/body into `fetchRemotePage()` request.
- Supply `initiatorUrl` from virtual page context.
- Return proxy result to `VirtualFetch` without adding cookie material.
- Fail clearly if alias is absent when remote network is requested.

Do not wire this adapter into the OS runtime yet. Street 1 proves the seam in isolation first.

## Tests to add/update

### Merkava transport tests
- Existing local file fetch stays local even when transport is supplied.
- Existing data URL fetch stays local.
- Network miss calls transport exactly once.
- Relative URL is resolved against virtual base URL before transport.
- Transport response status/final URL/content type/text become virtual response evidence.
- Missing transport preserves virtual 404.
- Transport rejection becomes a bounded failed fetch result/error according to existing fetch semantics.

### Proxy client tests
- POST string body is serialized to API payload.
- Base64 body is serialized to API payload.
- Existing GET behavior is unchanged.
- Same-origin credentials remain enabled.
- Cookie/Set-Cookie data is not introduced.

### Adapter tests
- URL resolution is guest-page-relative.
- Alias/jar/project/initiator are host-owned.
- Request body flows through without logging/exposing its content.

## Validation sequence

Perform each as a separate command/action:

1. Syntax check each touched file.
2. Run focused new VirtualFetch tests.
3. Run focused proxy-client/adapter tests.
4. Run existing Merkava fetch/browser tests.
5. Run existing Drive browser proxy tests.
6. Audit touched production line counts <=120.
7. Search corrected Street 1 files for `Chromium`, `CDP`, `remote-debugging`, `webSocketDebuggerUrl`, `Cookie:` and `Set-Cookie` leakage markers.

## Stop gate

After Street 1 passes, stop and reassess source state before beginning resource graph collection. Do not simultaneously:
- rewire navigation,
- add module executor,
- add popup hooks,
- remove Chromium routes/files.

Those are later streets and must not be mixed into this proof.
