# B"H
# YouTube Migration

Boruch Hashem. Blessed is He.

The Awtsmoos lets a creator carry chronology, descriptions, playlists, and source truth without counterfeit history;
Awtsmoos.com keeps IA-S3 keys local, sends video directly to the Archive shore, and remembers only bounded public recovery history.

## Choose the right path

Use `/youtube/` for the authenticated YouTube manager.
Use `/youtube/migrate/` for creator-owned acquisition, Archive.org storage, dry planning, recovery, and explicit publication.
Use `/social/migrate/` for unified Facebook/Instagram migration.

## Google Takeout

1. Open Google Takeout and select **YouTube and YouTube Music**.
2. Choose the YouTube data you want and a one-time ZIP export.
3. Download every generated archive part.
4. Keep video beside `.info.json`, descriptions, thumbnails, subtitles/captions, and playlist metadata when available.
5. Open `/youtube/migrate/`.

Google Takeout help: https://support.google.com/accounts/answer/3024190?hl=en
Google Takeout: https://takeout.google.com/

## Download one owned video

YouTube Studio → Content → owned video menu → Download.
YouTube Studio download help: https://support.google.com/youtube/answer/56100?hl=en
YouTube Studio: https://studio.youtube.com/

## Advanced yt-dlp creator workflow

`/youtube/migrate/` can generate local `yt-dlp` commands for creator-owned material.
Review commands before running them.
Preserve info JSON, descriptions, thumbnails, subtitles/automatic captions, timestamps, and playlist evidence when useful.
Only migrate material you own or are authorized to migrate.

## Archive.org direct video storage

Video does not pass through Awtsmoos storage.

1. Get IA-S3 keys at https://archive.org/account/s3.php.
2. Save them locally in the migration studio; session-only is the default.
3. Device persistence is explicit and should be used only on a trusted device.
4. Choose local video files or an extracted downloaded folder.
5. The browser resolves prior public receipts before asking for credentials.
6. On a true upload miss, the browser checks Archive.org capacity and PUTs directly to `https://s3.us.archive.org`.
7. Awtsmoos receives only canonical `https://archive.org/download/...` public evidence.
8. **Forget credentials** clears local secret storage but does not erase already-public Archive.org files.

IAS3 documentation: https://archive.org/developers/ias3.html

## Resilient video recovery

A successful direct PUT is journaled locally as public-only evidence before the dry-plan phase begins. This matters when Archive.org succeeds but planning, publication, the page, or the network fails afterward.

The shared receipt includes sampled file fingerprint, Archive identifier, fingerprint-suffixed filename, public URL, MIME, bytes, ETag when available, upload state, and timestamps. It excludes `File`, `Blob`, access key, secret key, and Authorization.

The fingerprint is `sample-sha256-v1`: SHA-256 over bounded beginning/middle/end slices plus file size and MIME. It is designed for practical local recovery without copying a multi-gigabyte video into memory and is not claimed to be a full-file digest.

After reload, choose the local video again. Fingerprinting and receipt lookup happen **before** the credential provider is invoked. A matching receipt therefore reuses the public Archive.org asset without another IA-S3 key prompt or another video PUT.

Two simultaneous attempts for the same fingerprint and Archive target share one in-memory upload operation.
Receipts are capped at 96 entries and pruned after 180 days.

## Public verification after PUT

A successful IAS3 PUT means Archive.org accepted the upload, but public visibility/derivation may lag.
The browser stores that result as `uploaded`, then checks the credential-free Archive.org Metadata API for the exact filename.
If the file is listed, the receipt becomes `verified`.
If metadata is delayed or temporarily unavailable, the receipt remains `uploaded`; later recovery rechecks metadata and does **not** retransmit the video bytes.

## Legacy checkpoint compatibility

Pre-V2 YouTube checkpoints have public Archive URLs but no sampled fingerprint. Those entries keep their old feature-scoped reuse behavior so upgrading does not force creators to re-upload successful historical video.
New V2 checkpoints preserve fingerprint, receipt state, verification timestamp, ETag, and byte count as public evidence only.
A fingerprinted checkpoint can repopulate a cleared shared receipt ledger only when the current file fingerprint and canonical Archive identifier/filename match exactly.

## Dry plan and explicit publish

The advanced studio performs:
local files → receipt lookup/direct Archive.org storage → public-only checkpoint → migration dry plan → review → explicit unified publish.

Planning must not publish.
Archive upload must not publish.
Actual creation goes through `/api/social/unified-social/publish`.
The YouTube server guard accepts `archive.mediaUrl` only when it is a canonical Archive.org download URL and rejects credential-like fields.

## Playlist, chronology, and provenance

YouTube playlists may map to Awtsmoos Series when source evidence proves the relationship.
A video may retain playlist provenance even when one canonical Series is selected.
Original known publication time is preserved; missing/invalid time remains **Unknown**, never January 1, 1970.

Source provenance may preserve YouTube video/channel identity, original URL, publication time, playlists, public Archive.org identifier/URLs, transcript languages, and migration time.
IA-S3 credentials are never provenance.

## Publication resumability

The YouTube checkpoint stores only public archive results and completed publication state.
It excludes `File`, object URL, access key, secret key, and Authorization headers.
If publication fails after video archiving succeeds, retrying publication reuses the public archive evidence instead of sending the video again.
Deterministic publication idempotency prevents duplicate native posts.
