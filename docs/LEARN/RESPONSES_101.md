B"H
Boruch Hashem
Blessed is He

# Responses 101

## What you will learn

How to reason about Awtsmoos responses without inventing a universal JSON schema.

## Observed response families

- JSON-like values returned by dynamic handlers;
- explicit status-code changes;
- response-header changes;
- binary/file/download behavior;
- streaming responses;
- WebSocket upgrade handshakes.

## Generated evidence

Every route tutorial joins source-level status and header literals when present. Absence means **no lexical evidence was found**, not “always 200 JSON.”

## Calling discipline

1. Inspect the exact handler return value.
2. Inspect any `statusCode` changes.
3. Inspect explicit `setHeader` behavior.
4. Determine whether the body is JSON, text, bytes, stream, redirect, or upgrade.
5. Read tests/callers for usage examples.

## Common mistakes

- parsing every successful response as JSON;
- assuming 404 means filesystem absence rather than route/resource logic;
- treating CORS headers as proof of anonymous authorization;
- assuming a generated status list is exhaustive runtime behavior.

See [API Response Patterns](../API/RESPONSE_PATTERNS.md).
