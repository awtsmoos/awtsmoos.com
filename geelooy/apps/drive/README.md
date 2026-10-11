B"H

# Drive API — Agent Handoff

File storage with sharing, used by agents to persist generated assets (notably **LAW 8 reference images**: generate → upload → public URL → link to page). Facade: `geelooy/apps/drive/js/api.js` over the `driveApiRegistry` (resources: `entries`, `projects`, `sites`).

## Facade (front-end, `js/api.js`)

```js
createEntry(values)        // POST /drive/{alias}/entries
updateEntry(path, values)  // PUT  /drive/{alias}/entry/{path}
performAction(action, values) // POST /drive/{alias}/actions/{action}
publicUrl(path)            // builds the public URL, NO server call
```

## Upload a binary file (images, etc.)

Server: `PUT /api/social/drive/{alias}/stream/{path}` (see `geelooy/api/social/helper/drive/routes/streamingRoutes.js`; client helper `js/streamUpload.js`).

```bash
curl --fail-with-body -X PUT \
  -H 'x-awtsmoos-api-key: KEY' \
  -H 'idempotency-key: ref-law8-homepage-001' \
  -H 'content-type: image/png' \
  -H 'x-drive-visibility: public' \
  -H 'x-drive-cache-policy: immutable' \
  --data-binary @ref.png \
  'https://awtsmoos.com/api/social/drive/ALIAS/stream/reference-images/homepage/ref.png'
```

Header contract:
- `idempotency-key` (required): same key + same bytes → `200 {replayed:true}`; same key + different bytes → `409`.
- `x-drive-visibility`: `public` | `private` (default `private`). **Public requires the credential to hold both `drive.write` AND `drive.public` scopes** (`scopePolicy.js`).
- `x-drive-cache-policy`: `mutable` (default) | `immutable`.
- `x-drive-mime` (or `content-type`): set it, or served bytes get the wrong type.
- Auth: `x-awtsmoos-api-key: <key>` or `Authorization: Bearer <token>`.
- 201 on first commit. 512 MiB per-file cap.

## Upload small text (JSON/metadata)

`POST /api/social/drive/{alias}/entries` with `{path, type:'file', content, mime, visibility:'public', cachePolicy}` (via `createEntry`). Folders: `{path, type:'folder', visibility}`.

## Make an existing file public

- **No re-upload:** `updateEntry(path, {visibility:'public'})` → `PUT /drive/{alias}/entry/{path}` (needs `drive.public` scope + write authority).
- **At upload:** `x-drive-visibility: public` header.
- Folder share records (`js/sharing.js`, `POST /drive/{alias}/share/{path}`) are advisory labels — the canonical public-serving mechanism is **entry-level `visibility:'public'`** per file.

## Get the public URL

```js
publicUrl(path) // → `${location.origin}/api/social/drive/public/${alias}/${encodeDrivePath(path)}`
```

Canonical: `https://awtsmoos.com/api/social/drive/public/{ALIAS}/{path}` — public GET/HEAD/OPTIONS, `Access-Control-Allow-Origin: *`. Folders serve `{path}/index.html`. Immutable-hash form: `/api/social/drive/immutable/{ALIAS}/{objectHash}` (entry must be `visibility:'public'` **and** `cachePolicy:'immutable'`). Server 404s unless `entry.type==='file' && !entry.trashedAt && entry.visibility==='public'`.

## LAW 8 reference-image flow (the agent pattern)

1. Generate the reference image (`media.generate_image`).
2. `PUT /drive/{ALIAS}/stream/{path}` with a durable `idempotency-key`, `x-drive-visibility: public`, `x-drive-cache-policy: immutable`.
3. Keep the operation receipt; verify the entry record.
4. `HEAD` the public URL to confirm it serves; embed the URL as the page's design reference (`data-design-ref` / page metadata; name it in the commit message).

## Common errors

| Error | Fix |
|---|---|
| 401 | Missing/invalid auth — `x-awtsmoos-api-key` or `Authorization: Bearer`; facade `assertConnected()` needs alias + credential |
| 403 on public upload / visibility change | Credential lacks `drive.public` scope (needs `drive.write` + `drive.public`) |
| Public URL 404 on a just-uploaded file | `visibility` still `private`, or entry trashed — re-PUT metadata `{visibility:'public'}`, then HEAD the URL |
| 409 on stream upload | `idempotency-key` reused with different bytes — derive a fresh key (include a content hash) |
| Rejected before streaming | >512 MiB or bad `Content-Length` |
| Stale bytes after update | Use `x-drive-cache-policy: mutable` for changing files; `immutable` only for hash-addressed content |

## Files map

- Facade: `geelooy/apps/drive/js/api.js`; resources `js/api/BeriahEntriesResource.js`, `AtzilusResourceClient.js`, `KeterDriveTransport.js`; streaming `js/streamUpload.js`; sharing `js/sharing.js`
- Server: `geelooy/api/social/helper/drive/routes/{entryRoutes.js,entryCollectionOperation.js,entryMutationOperation.js,streamingRoutes.js,publicRoutes.js,actionRoutes.js}`, `../scopePolicy.js`, `../streamingUploadPolicy.js`
- Examples: `geelooy/docs/generated/content/docs-drive-api-examples-md-*.json`
