<!--B"H
Boruch Hashem
Blessed is He
The Awtsmoos joins oros and keilim: logical metadata is the vessel, content-addressed bytes are the light.
-->

# Architecture and security

## Data model

Each alias has a Drive root containing `state.json`, an `objects/` tree, and temporary `incoming/` files. `state.json` contains entries, usage, quota, reservations, transfer leases, rate windows, idempotency records, and audit events. A file entry records path, owner alias, object hash, size, MIME type, visibility, cache policy, timestamps, and trash state. Folders are logical entries and do not own physical objects.

Object files are addressed by SHA-256. Upload finalization links a completed temporary object into the hash path atomically; an existing hash is reused. Logical byte accounting counts each logical file, while physical storage may be lower because of deduplication.

## Authentication and ownership

Drive requests authenticate with either a user API key or a Drive bearer credential. Authorization resolves an actor and credential, validates alias ownership or administrator authority, and enforces scopes. Service credentials have explicit lifecycle records, expiration/revocation state, and narrow scopes. The migration credential is limited to `drive.migrate`; it cannot invoke alias, quota, credential, or provisioning control-plane operations.

Administrator users are allowlisted by configuration. Ordinary users cannot perform administrator actions. Public routes do not invoke control-plane routes.

## Quotas and accounting

Per-alias policy includes storage bytes, file count, maximum single-file bytes, monthly ingress, monthly public egress/background traffic, monthly requests, upload starts per minute, requests per minute, and concurrent transfers. Exact-length reservations protect storage and file-count capacity before writes. Request and upload rate windows are charged before transfer. Transfer leases enforce concurrency and are released on success, error, abort, or disconnect.

Stored-byte and file-count counters describe logical entries. Monthly ingress is charged according to accepted request bytes; public egress is charged through public delivery. Reconciliation recomputes logical usage from entries and verifies object sizes.

## Bounded streaming write flow

`PUT /api/social/drive/{aliasId}/stream/{path}` requires authentication, `Content-Length`, and `Idempotency-Key`.

1. Validate method, headers, path, scope, quota, rates, and concurrency.
2. Reserve the exact logical byte/file delta.
3. Pipe the raw request through a Transform that increments byte count and SHA-256 while respecting backpressure.
4. Write a mode-0600 temporary file and fsync it.
5. Atomically hard-link the object into its content-addressed destination, reusing an existing object when deduplicated.
6. Commit logical metadata, usage, idempotency record, and audit event atomically.
7. Release reservation and transfer lease.
8. On failure or disconnect, remove temporary and newly unreferenced objects and release all transient state.

The route rejects a missing length with 411, an overrun or underrun with 400, a quota breach with the quota error, and an idempotency conflict with 409.

## Public hosting contract

The public route is `/api/social/drive/public/{aliasId}/{path}`. It supports GET and HEAD, single byte ranges, CORS, ETag, Last-Modified, `If-None-Match`, and `If-Modified-Since`. MIME type comes from explicit metadata or path detection. HTML and mutable logical names revalidate; immutable content uses long-lived immutable caching only when policy allows it. Missing or private entries are non-disclosing and non-cacheable.

## Manager security and accessibility

The Manager is served from `/api/social/drive/manager/`. Credentials live only in JavaScript module memory and password inputs; localStorage and sessionStorage are not used. Static asset paths reject traversal, hidden files, unsupported extensions, and unsupported methods. Responses use `nosniff`. The UI uses safe DOM construction, native dialogs, live status announcements, visible focus, reduced-motion rules, forced-colors-compatible styling, and a horizontally contained file table at narrow widths.
