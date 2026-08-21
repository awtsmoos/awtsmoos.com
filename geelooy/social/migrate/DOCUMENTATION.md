# B"H
# Social Migration Studio

Boruch Hashem. Blessed is He.

The Awtsmoos renews remembered social vessels without pretending their history was born here;
Awtsmoos.com opens archives locally, sends creator video straight to Archive.org, and reuses public proof when recovery draws near.

## What this studio does

`/social/migrate/` imports authored Facebook and Instagram history and links to advanced YouTube migration.
Choosing a ZIP, folder, JSON file, or HTML file does **not** upload it.
Metadata is inspected locally. Only media for explicitly selected memories is considered after import begins.

## Facebook export tutorial

1. Open **Accounts Center** → **Your information and permissions** → **Export your information**.
2. Choose **Create export**, then the Facebook profile whose history you want.
3. Choose **Export to device**, content, date range, format, and media quality.
4. Prefer **All time** and **JSON** for the fullest structured migration.
5. Download the ZIP and open it, its extracted folder, JSON, or older HTML export in `/social/migrate/`.

Official Facebook export help:
https://www.facebook.com/help/212802592074644

## Instagram export tutorial

1. Open **Accounts Center** → **Your information and permissions** → **Export your information**.
2. Choose **Create export**, then the Instagram profile whose history you want.
3. Choose **Export to device**, content, date range, format, and media quality.
4. Prefer **All time** and **JSON**.
5. Download the ZIP and open `/social/migrate/`.

Official Instagram export help:
https://www.facebook.com/help/181231772500920

## YouTube export tutorial

For a whole archive, use Google Takeout and select **YouTube and YouTube Music**.
Google Takeout help: https://support.google.com/accounts/answer/3024190?hl=en
Google Takeout: https://takeout.google.com/

For one owned video, use YouTube Studio → Content → video menu → Download.
YouTube Studio download help: https://support.google.com/youtube/answer/56100?hl=en
YouTube Studio: https://studio.youtube.com/
Advanced Awtsmoos migration: `/youtube/migrate/`

## Video storage: Archive.org direct

Video is never uploaded into the Awtsmoos native asset vault.

1. Get Internet Archive IA-S3 keys at https://archive.org/account/s3.php.
2. Save them in the local credential panel; session-only is the default.
3. Choose **Remember on this device** only on a trusted device.
4. Selected video bytes travel directly from this browser to `https://s3.us.archive.org`.
5. Awtsmoos receives only canonical `https://archive.org/download/...` public attachment evidence.
6. Use **Forget credentials** to clear both session and device credential storage.

Internet Archive IAS3 documentation:
https://archive.org/developers/ias3.html

Images and audio continue through the bounded native Awtsmoos asset endpoint.
A huge video trapped inside a ZIP may need extraction first so the browser does not inflate gigabytes into memory.

## Resilient public upload receipts

After a successful direct video PUT, the browser writes a bounded local receipt containing **public evidence only**: sampled file fingerprint, Archive identifier/filename/public URL, size, ETag when available, state, and timestamps.
The receipt contains no access key, secret key, Authorization header, `File`, or `Blob`.
Receipts are bounded to 96 recent entries and expire after 180 days.

The fingerprint algorithm is `sample-sha256-v1`: SHA-256 over bounded beginning/middle/end slices plus file size and MIME type. It avoids loading a multi-gigabyte video wholly into memory and is explicitly not described as a full-file SHA-256.
New Archive filenames include a short fingerprint suffix so changed content cannot silently overwrite a previous same-name target.

On retry or reload, reselect the same local video. The shared Archive.org service fingerprints it **before** asking for IA-S3 credentials. If matching public evidence exists, no second video PUT and no credential prompt are required.
Two simultaneous attempts for the same fingerprint/Archive target share one in-memory upload operation.

A successful PUT is saved as `uploaded` before downstream planning. The browser then checks the public Archive.org Metadata API for the exact filename without upload credentials. If observed, the receipt becomes `verified`. If public propagation is delayed, the receipt remains `uploaded`; retrying verification does not retransmit the video.

## Local-first archive safety

ZIP opening reads the central directory first instead of inflating every media file.
HTML is neutralized before detached parsing: scripts/executable containers disappear and fetch-capable attributes become inert.
Archive paths reject traversal, absolute paths, URI schemes, Windows drive escapes, and NUL bytes.
Unknown source dates remain **Unknown** and never become January 1, 1970.

## Review and import flow

1. Open the archive locally; inspect, filter, and select memories.
2. Choose Alias, Heichel, and Series.
3. Run server preflight and generate the dry plan.
4. Explicitly choose **Begin import**.
5. Upload selected image/audio to Awtsmoos and resolve selected video through direct Archive.org receipts/upload.
6. Checkpoint only public attachment evidence after each resolved asset.
7. Re-run the dry plan with real public paths.
8. Publish through `/api/social/unified-social/publish`.
9. Retry failures without duplicating completed idempotency keys or already-archived video bytes.

## Provenance and recovery

Historical reactions/comments/shares remain provenance and never become fake native comments.
The feature checkpoint stores serializable public evidence only: selections, destination, public attachments, completed publication evidence, failures, and timestamps.
It never stores `File`, object URL, IA-S3 access/secret keys, or Authorization headers.
Pre-V2 no-fingerprint checkpoints remain backward-compatible; new fingerprinted video can repopulate the shared receipt ledger after a reload.
Reopen/reselect local files because browser file handles are not silently persisted.

See `API.md` for exact server boundaries and capability negotiation.
