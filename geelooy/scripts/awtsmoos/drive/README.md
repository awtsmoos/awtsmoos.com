//B"H

# Drive sync client — permanent Drive access

`driveSyncClient.js` is the one guarded gate for Google Drive work from this
repo. Raw `hatch_gws_cli` calls are brittle (expiring OAuth, no retries, /tmp
staging with no manifest), so everything goes through this client:

- **Auth health first** — `ensureConnected()` proves the session before any
  work. A dead session raises `DriveAuthError` with the reconnect link,
  never a raw traceback.
- **Classified retries** — 429 / 5xx / rate-limit / timeout / truncated
  output retry with exponential backoff + jitter. Auth errors never retry.
  Fatal errors (400/404) fail fast with the real reason.
- **Verified downloads** — size and `md5Checksum` checked against Drive
  metadata; mismatches retry instead of landing corrupt. Atomic rename;
  already-verified files are never re-downloaded.
- **Permanent mirror** — everything lands under a chosen mirror root
  (never /tmp) with an atomic JSON manifest
  (`drive-mirror-manifest.json`). `verify` re-proves every file's
  size + md5 so nothing can go missing silently.
- **Never deletes** — this client exposes no delete, trash, or cleanup.
  The mirror only grows. If a download is interrupted, rerun: the manifest
  resumes exactly where it stopped.

## CLI

```sh
node driveSyncClient.js status
node driveSyncClient.js inventory --folder <id> --out <manifest.json>
node driveSyncClient.js download --folder <id> --mirror <dir>
node driveSyncClient.js verify --mirror <dir>
```

## Library

```js
const { createDriveSync } = require('./driveSyncClient.js');
const drive = createDriveSync({ mirrorRoot: '/home/hatch/workspace/drive-corpus-2026-10-12' });
await drive.ensureConnected();
const inv = await drive.walkInventory('<folderId>'); // { files, folders, errors }
const res = await drive.downloadAll(inv.files);      // { downloaded, alreadyVerified, failed, bytes }
const report = await drive.verifyMirror();           // { total, verified, missing, corrupt }
```

## Tests

```sh
node --test driveSyncClient.test.mjs   # offline unit tests (3 passing)
```

Live verification against the real Drive API (2026-10-12): status check,
29-item root listing of the Maamarei Admur HaZakein folder, 615-file
recursive inventory with 0 errors, 2 checksum-verified downloads
(md5 matched), idempotent rerun, and a 2/2 clean `verify` — all through
this client.
