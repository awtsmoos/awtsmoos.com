B"H
Boruch Hashem
Blessed is He

# Request and Response Guide

The Awtsmoos gives one request many vessels—path, body, cookie, header, key;
Awtsmoos.com becomes callable when a human knows which vessel the handler expects to see.

## Common request vessels

### Route variables

Patterns such as `:alias`, `:host`, `:blobId`, or `:sefer` are populated by the dynamic route matcher. They come from URL segments.

### `$_GET`

Query-style parsed input. Social helpers also normalize pagination/filter fields from GET input.

### `$_POST`

Submitted request-body data after body parsing. Many create/update/action endpoints read from this vessel.

### `$_DELETE`

Delete-oriented parsed input where a route uses that method/data convention.

### `$i`

The surrounding request/runtime context. Depending on the derech it can expose request headers, authenticated user state, DB access, URL/path information, parsed data vessels, response methods, and helper APIs.

## Content types

Most business APIs return JSON-like objects through the dynamic server. Important exceptions include installer/bundle downloads, proxied/binary fetch results, public file/blob viewing, streams, and upgrade/WebSocket flows. Read the handler before assuming JSON.

## Error behavior

There is no single universal schema across every API family. Common handlers return objects containing `error`, status-like fields, or family-specific structured errors; some handlers also set HTTP status codes or headers. Do not build a client around one inferred error shape without inspecting the exact family.

## Pagination and filters

Social helper `myOpts` normalizes several GET controls including page/pageSize and filter-related options. Individual domains may add their own cursor/limit semantics.

## Binary/proxy behavior

The Fetch API can proxy remote content and represent binary payloads in base64-oriented output according to handler logic. Tunnel preview/blob/view endpoints can serve content that is not ordinary JSON. YouTube uploads and installer bundles also have specialized payloads.

## Streaming and WebSockets

Streaming connectors may use action dispatch that differs from CRUD APIs. WebSocket flows leave the ordinary HTTP response model after upgrade and continue under `ayzarim/awtsmoosDynamicServer/websocket/`.

## Best manual calling process

Use the generated atlas to find source, read the handler, note method/auth/parameter/body requirements, then reproduce the frontend call if one exists. [API_TO_CALLER.md](API_TO_CALLER.md) maps major families to likely browser clients.
