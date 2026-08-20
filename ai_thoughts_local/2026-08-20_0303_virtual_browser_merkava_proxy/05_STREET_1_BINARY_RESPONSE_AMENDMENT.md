B"H
Boruch Hashem
Blessed is He

# Street 1 Amendment — Preserve Remote Bytes

> The Awtsmoos gives text and binary different garments; Awtsmoos.com should not force an image, archive, or typed-array response through a Unicode throat merely because the first bridge was built for pages.

## New evidence

- `proxyResponse.js` returns both `text` for textual MIME types and authoritative `bodyBase64` for every remote body.
- `VirtualFetchHelpers.virtualResponse()` currently converts every body through `String(body)`, so feeding remote binary into it would corrupt `arrayBuffer()` semantics.
- `VirtualBytes.js` already centralizes browser/Node byte normalization but its current base64 helper decodes immediately to UTF-8 text.

## Street 1 refinement

Before rewriting `VirtualFetch.js`, also rewrite these already-read helper files:

1. `VirtualBytes.js`
	- Add `decodeBase64Bytes()` returning `Uint8Array`.
	- Keep existing `decodeBase64()` behavior by delegating through the byte decoder and UTF-8 decoder.

2. `VirtualFetchHelpers.js`
	- Generalize `virtualResponse()` to preserve a normalized byte body.
	- `text()` decodes bytes as UTF-8 unless an explicit textual witness is supplied.
	- `arrayBuffer()` returns the exact normalized bytes.
	- `headers.get()` reads from the safe response-header map case-insensitively, with content-type fallback.
	- Preserve all existing call signatures by making new header/text arguments optional.

3. `VirtualFetch.js`
	- Decode transport `bodyBase64` through `decodeBase64Bytes()`.
	- Prefer transport `text` as the textual witness when provided.
	- Pass safe response headers/final URL/status into generalized `virtualResponse()`.

This remains Street 1: it changes only Fetch transport/response semantics and does not touch navigation, scripts, modules, popups, Chromium unwinding, or page-resource collection.
