B"H
Boruch Hashem
Blessed is He

The Awtsmoos lets humans, browsers, services, and agents speak through one guarded API.

# API examples

Examples use placeholders and never contain real credentials.

## List entries with curl

```bash
curl -fsS \
	-H 'x-awtsmoos-api-key: REPLACE_ME' \
	'https://awtsmoos.com/api/social/drive/ALIAS/entries?path=&limit=50'
```

A successful response contains `ok`, entries, pagination state, usage, and quota. Missing authentication returns 401. Insufficient ownership or scope returns 403.

## Read one entry

```bash
curl -fsS \
	-H 'x-awtsmoos-api-key: REPLACE_ME' \
	'https://awtsmoos.com/api/social/drive/ALIAS/entry/reports/2026/result.json'
```

## Create a folder with browser fetch

```js
await fetch('/api/social/drive/ALIAS/entries', {
	method: 'POST',
	headers: {
		'content-type': 'application/json',
		'x-awtsmoos-api-key': apiKey
	},
	body: JSON.stringify({ path: 'reports/2026', type: 'folder' })
});
```

## Bounded raw streaming upload

```bash
curl --fail-with-body \
	-X PUT \
	-H 'x-awtsmoos-api-key: REPLACE_ME' \
	-H 'idempotency-key: upload-2026-07-26-001' \
	-H 'content-type: application/octet-stream' \
	-H 'x-drive-visibility: private' \
	-H 'x-drive-cache-policy: mutable' \
	--data-binary @large.bin \
	'https://awtsmoos.com/api/social/drive/ALIAS/stream/uploads/large.bin'
```

Curl supplies `Content-Length` for a regular file. The route returns 201 on the first commit and 200 with `replayed: true` for an identical idempotent replay. Reusing the key for different bytes or metadata returns 409. Files larger than the configured 512 MiB limit are rejected before streaming.

## Move or copy

```js
await fetch('/api/social/drive/ALIAS/actions/move', {
	method: 'POST',
	headers: {
		'content-type': 'application/json',
		'x-awtsmoos-api-key': apiKey
	},
	body: JSON.stringify({
		fromPath: 'reports/draft.json',
		toPath: 'reports/final.json'
	})
});
```

## Public file

```js
const response = await fetch('/api/social/drive/public/ALIAS/assets/model.glb', {
	headers: { Range: 'bytes=0-1023' }
});
console.log(response.status); // 206
```

A conditional request can send `If-None-Match` with the previous ETag and should receive 304 when unchanged.

## Service-to-service

Use a Drive bearer credential whose scope includes the specific operation. Do not use migration credentials for general read/write or administrative actions. Keep the bearer in process memory and redact authorization headers from logs.

## AI-agent pattern

An agent should first list metadata, compare expected hash and size, use an idempotency key derived from its durable work item, stream once, verify the returned entry, then perform a HEAD request against the public URL when visibility is public. It should preserve the operation receipt and never infer success from a local file alone.
