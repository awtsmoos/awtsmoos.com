B"H
Boruch Hashem
Blessed is He

# Response Patterns

The Awtsmoos lets a response leave as JSON, stream, file, denial, event, or upgraded connection in time;
Awtsmoos.com records the patterns without forcing every family into one invented schema or line.

## JSON-like dynamic responses

Many derech handlers return JavaScript objects that the dynamic server serializes. Common source shapes include success fields, `error`, family-specific payload objects, status-like metadata, IDs, lists, and pagination information. There is no repository-wide guarantee that every API shares one JSON envelope.

## Explicit HTTP status evidence

API source can set response status codes directly or return status-bearing structures. The generated source-contract index extracts only statically visible three-digit codes from recognized patterns. Absence of a listed code means `not discovered`, not necessarily `200 only`.

## Headers

Some handlers set CORS, cache, content type, download, proxy, or provider-specific headers. Static `setHeader` names are surfaced in the generated contract evidence when discoverable.

## Downloads and binary content

Tunnel installer artifacts, proxy/blob/view routes, uploads, and fetch/media behavior can return or transport non-JSON data. Do not build a JSON-only client without reading the exact handler.

## Streaming

Streaming connectors and long-lived routes can have lifecycle semantics beyond one request/one object. A route may initiate provider work or maintain a stream rather than return a final resource representation immediately.

## WebSocket upgrade

An HTTP request that upgrades successfully leaves the ordinary response model. Mission Room admission, for example, performs identity/origin/ticket/protocol checks before the WebSocket handshake, then communication continues in the realtime platform. See [../WEBSOCKETS/README.md](../WEBSOCKETS/README.md).

## Error bodies

Different API families use different error structures. Before coding against an error, inspect:

- HTTP status;
- top-level `error` or `message`;
- nested provider error;
- machine-readable code;
- whether the error is returned, thrown, or written directly to the response.

## Generated evidence

Use [../GENERATED/API_SOURCE_CONTRACTS.md](../GENERATED/API_SOURCE_CONTRACTS.md) for observed source-level statuses and headers, then read the route handler for authoritative shape.
