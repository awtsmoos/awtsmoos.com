# B"H
# Social Migration API

Boruch Hashem. Blessed is He.

The Awtsmoos lets one migration intention pass through measured gates;
Awtsmoos.com keeps local inspection, external video custody, server validation, and publication visibly distinct.

## Capability discovery

`GET /api/social/migrations/meta/metadata`

API v3 returns:
- supported providers/archive formats
- `plan.maxItems`
- native image/audio upload limits and MIME lists
- `upload.video.nativeUpload = false`
- `upload.video.provider = "archive.org"`
- `upload.video.mode = "browser-direct"`
- `upload.video.credentials = "local-only"`
- `upload.video.serverReceivesCredentials = false`
- canonical Archive.org public URL prefix
- publication/checkpoint contracts

Native limits derive from the same `assetPolicy` used by the upload server.

## Native asset boundary

`POST /api/social/assets/:alias/upload`

The native vault accepts bounded image/audio files.
Known `video/*` MIME types return:

`VIDEO_EXTERNAL_STORAGE_REQUIRED`

Video bytes are intentionally refused before any filesystem write.
The server never asks for Archive.org IA-S3 credentials.

## Archive.org browser boundary

The browser may use local IA-S3 credentials only for direct requests to:

`https://s3.us.archive.org`

Internet Archive documents HTTPS `PUT`, `Authorization: LOW access:secret`, new-item headers, metadata headers, size hints, derive behavior, SlowDown responses, and overload preflight:
https://archive.org/developers/ias3.html

Credential creation:
https://archive.org/account/s3.php

After direct upload, migration state may contain only public attachment evidence such as:

```json
{
	"type": "video",
	"mime": "video/mp4",
	"publicPath": "https://archive.org/download/item/video.mp4"
}
```

The migration server accepts remote video only when the URL is canonical HTTPS `archive.org/download/<identifier>/<filename>` with no credentials, port, query, fragment, traversal, or alternate host.

## Preflight

`POST /api/social/migrations/meta/preflight`

Preflight never publishes.
It returns validity, deterministic plan fingerprint, provider/date/media statistics, warnings, and structured issues.
Secret-shaped fields such as access keys, secret keys, Authorization, tokens, or passwords are rejected recursively.

## Dry plan

`POST /api/social/migrations/meta/plan`

Planning never publishes.
API v3 plan envelopes contain destination, statistics, warnings, chronology distribution, and entries.
Each entry contains deterministic hashed idempotency, native unified-social publication intent, provenance, and native-shaped `rootAssets`.
Unknown dates remain `Unknown`.

## Public attachment whitelist

Browser planning code does not spread provider objects into requests.
It whitelists public attachment fields such as:
- `id`
- `type`
- `mime`
- `size`
- `publicPath`
- alt/caption/role
- dimensions/duration where present

Private provider fields cannot hitchhike into a migration manifest.

## Publication

Actual mutation occurs only through:

`POST /api/social/unified-social/publish`

Archive.org upload success is **not publication**.
The client checkpoints the public URL, regenerates the dry plan, presents it for review, and publishes only after explicit user action.

## Idempotency, pacing, and recovery

Meta idempotency hashes provider, source ID, Alias, Heichel, and Series.
Native image/audio upload pacing uses the server-returned `remaining` and `resetAt`.
Archive.org video pacing uses Archive.org's own overload preflight and bounded transient retries.
Authentication errors are not blindly retried.
Checkpoints exclude credentials and local `File` objects.
