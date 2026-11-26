B"H
# Rebbe Sichos Search API — ledger (2026-11-26)

## What the existing code actually does (read end to end first)
- Data: NO local sichos files. Front end (geelooy/apps/rebbe) browses Archive.org.
  modules/store.js YEARS maps 41 Hebrew years (5711-5752, sparse) to Archive.org item ids.
- Search: immutable shards on Archive.org items months-1764928230 (per Hebrew month 1-12)
  and days-1764928230 (per day 1-30); events {title, year, month, month_id, day, bucket, folder}.
  search.js + modules/network/search-live.js: union per constrained dimension, intersect
  dimensions, re-match every event, sort year/month/day/title. Identity = bucket::folder.
- Tracks: modules/network/archive-live.js fetchFolderTracks tries folder index.json FIRST,
  Archive.org metadata as fallback; both give same audio set (verified); index has sizes but
  no durations, metadata has durations + true format. Audio filter: mp3|opus|ogg|wav|m4a|wma|flac;
  dedupe by cleaned title, sort by path.
- Real formats (verified from metadata + magic bytes): most items are true VBR MP3, but whole
  items (e.g. 5747-1764759611, all 161 files) are Opus audio in .mp3 filenames (OggS magic).
  One 5712 file has an isolated corrupt MPEG header mid-stream (ffmpeg tolerates, strict parsers die).
- Downloads today: single track = direct Archive.org link; many = in-browser stored ZIP via
  modules/zip-store.js makeZip (no compression); one event as one audio = lossless MP3 frame
  join via modules/download/farbrengen/mp3-join.js (strict: rejects corrupt frames / non-MP3).

## Built (all new, geelooy/api/rebbe/ — front end untouched)
- _awtsmoos.derech.js + lib/{catalog,archive,search,bundle,mp3join,page,response}.js, README, tests.
- Endpoints: / (JSON descriptor), /docs, /health, /options, /search, /event, /bundle (GET|POST),
  /bundle/data, /bundle/page, /bundle/zip, /bundle/merge.
- Search is a faithful server port of the front-end logic; YEARS parsed live from the front
  end store so the API cannot drift. Tracks expanded from Archive.org metadata (superset:
  size, duration, md5, true sourceFormat, direct + standard URLs).
- Bundles are stateless: id = base64url(normalized search). Page reuses the app zip-store and
  mp3-join in-browser; plus merged-WAV fallback (Web Audio decode + WAV encode) for mixed
  formats; plus server ZIP and server merged MP3 (lib/mp3join.js tolerant frame joiner with
  coverage guard that detects misnamed non-MP3 segments).
- Caps are explicit: search total/hasMore; bundle max 120 events + truncated flag; server
  zip/merge cap 300 files / 400 MB with 413; merge 422 on non-MP3 segment or profile mismatch.

## Live verification (awtsmoos.com, after systemctl restart awtsmoos.service)
- Search cross-check vs raw-shard front-end logic: month=3 day=19 -> 47 (front end 47);
  month=1 day=19 -> 13 (front end 13). Ranges+keyword -> 34. Invalid year=9999 -> 0 (sentinel fix).
- Event endpoint matches Archive.org metadata exactly (size/md5/duration spot-checked).
- Bundle (19 Kislev 5712): created; server ZIP downloaded 45,335,800 bytes, valid stored ZIP,
  9 MP3s + manifest.json, sizes match manifest; UTF-8 filename flag set.
- Server merged MP3 (5744 Childrens Rally, 4 MP3 tracks): HTTP 200, 21,335,250 bytes,
  ffprobe duration 5333.8s vs manifest 5334s, full ffmpeg decode zero errors.
- Server merge on 5712 bundle: HTTP 422 SEGMENT_NOT_MP3 naming segment 9 (the Opus file) — honest refusal.
- Browser-page buttons verified as served HTML + module URLs 200; actual in-browser click
  assembly NOT exercised (no live-browser channel for this worker) — page reuses the app own
  production zip/join modules, and the identical algorithms were verified server-side.
- Front end /apps/rebbe/ still 200, untouched (git status: only pre-existing other-session changes).
- Unit tests: node --test geelooy/api/rebbe/test -> 8/8 PASS.

## 2026-11-26 (later) — downloads are CLIENT-SIDE ONLY (Hai's ruling; commit 37bb768fe)
- Hai used the server merge link for 19 Kislev 5726 (25 tracks, 181,601,226 bytes):
  it took far too long because the server itself downloaded all of it from
  Archive.org, joined it, and streamed it back. Ruling: the server must do NO
  heavy work for downloads; it serves the fancy bundle page and ALL
  downloading/zipping/merging happens in the user's browser.
- Before evidence: bounded probe of that exact /bundle/merge URL — no response
  at all within 20 s (HTTP 000, curl timeout); in real use it ran for minutes.
- Changes (5 files, rollback ref backup/pre-rebbe-client-downloads-20261126):
  * _awtsmoos.derech.js: zipRoute/mergeRoute deleted; one pageRedirectRoute —
    /bundle/zip -> 302 to the bundle page, /bundle/merge -> 302 to the page
    with action=merge. Endpoints stay mounted, so handed-out links keep working.
  * lib/bundle.js: bundleLinks — mergeDownloadUrl REMOVED; zipUrl is now the
    page with action=zip; mergeUrl unchanged (page action=merge); pageUrl is
    THE download link. buildZipBuffer/buildMergedBuffer and the server caps
    deleted — the server no longer fetches audio at all. makeStoredZip kept
    (pure writer, unit-tested; the page uses the app zip-store in-browser).
  * lib/page.js: the two "(server)" buttons and their wiring removed; the
    handlers became named downloadZip/downloadMerge/downloadWav functions and
    ?action=merge / ?action=zip now AUTO-START that assembly in the browser on
    load; merge-failure copy points at merged WAV / ZIP instead of a server.
    Docs section rewritten to match.
  * README.md + api/tunnel/control/docs/apiRegistry.js: injected instructions
    and the rebbe registry purpose now teach pageUrl as THE download link
    ("the server does no downloading"); descriptor text updated likewise.
- Tests: node --test geelooy/api/rebbe/test 8/8 PASS; apiRegistry.test.cjs PASS.
- Live verification (after systemctl restart awtsmoos.service):
  * Hai's exact merge URL: 302 Found, Location = bundle page &action=merge
    (2.83 s measured server-local on the saturated box; the handler itself is
    now a bare redirect — no manifest build, no fetch, no join). ZIP URL: 302
    to the plain bundle page. Following the merge redirect: 200 page in 0.8 s.
  * Bundle JSON for 5726/3/19: pageUrl + zipUrl (page&action=zip) +
    mergeUrl (page&action=merge) + manifestUrl; mergeDownloadUrl absent.
    Manifest endpoint unchanged: 25 tracks / 181,601,226 bytes.
  * Bundle page: 200 in 0.43 s, 12,464 bytes, gold design as before; served
    HTML contains zero server buttons and the client machinery — zip-store.js
    (ZIP), mp3-join.js (merged MP3), decodeAudioData (merged WAV) — all
    fetching Archive.org directly from the browser.
  * Live /api/tunnel/control/apis carries the new instruction text.
- Honest limit: actual in-browser click assembly still not exercised from this
  worker (no live-browser channel); the page reuses the app's own production
  zip-store / mp3-join modules, and auto-start invokes the same handlers the
  buttons do.

## 2026-11-26 (later still) - NO WAV: browser MP3 CONVERSION replaces it (Hai ruling; rollback backup/pre-rebbe-mp3-convert-20261126)
- Crash report: Hai opened the 19 Kislev 5726 bundle page and used merged WAV:
  25 tracks / ~6.1 hours decoded into ONE OfflineAudioContext PCM buffer
  (gigabytes) - page crashed. Ruling: no WAV; convert to MP3 in the browser.
- Key data fact: archive metadata LIES about format. The 5712 bundle file
  BH_009_Sicha 8.mp3 is labelled "VBR MP3" but its bytes start with OggS
  (Opus) - verified by range-fetch. So join-vs-convert is decided by
  SNIFFING each fetched file real bytes (ID3 / MPEG frame sync), never by
  the manifest format field alone.
- Changes:
  * lib/page.js: WAV button + downloadWav + encodeWav DELETED (served page
    now contains zero "wav"). downloadMerge fetches + sniffs every file:
    all-true-MP3 -> lossless mp3-join as before (a join failure now falls
    back to conversion instead of erroring); otherwise convertToMp3 -
    decodeAudioData ONE track at a time into a shared lamejs Mp3Encoder
    (128 kbps stereo / 96 kbps mono), each compressed blob and each decoded
    AudioBuffer released before the next track; encoded output accumulates
    as Blob parts; per-track progress + a Cancel button. ?action=merge
    auto-start uses the same join-vs-convert decision.
  * Vendored lamejs 1.2.1 minified (LGPL-3.0) at
    geelooy/apps/rebbe/modules/download/lame.min.js (156,043 bytes +
    attribution header; sha256 with header 2321aadce5...), loaded LAZILY
    via script injection only when a conversion actually runs.
  * Wording scrubbed of WAV: lib/bundle.js comments, _awtsmoos.derech.js
    descriptor + route comment, README, docs page section, and the tunnel
    apiRegistry injected instructions + rebbe purpose.
  * Test added: bundle page has no WAV option and converts in-browser
    (rebbe suite now 9/9 PASS; apiRegistry test PASS).
- Proof harness (node, /tmp/convert-proof.js): the page exact sniff on real
  bytes - BH_009 -> not MP3 (OggS), BH_001 -> MP3 (ID3). The per-track
  encode loop over 6 x 20s synthetic stereo tracks produced 1,920,522 bytes
  with 4,595 valid MP3 frames = exactly 120.0 s implied; peak live PCM was
  ONE track (6.7 MB) vs 40 MB if all tracks were held.
- Live verification (after systemctl restart awtsmoos.service): bundle page
  200 in 0.77 s, zero "wav" in served HTML, convert/sniff/cancel machinery
  present; lame.min.js served 200; /api/rebbe/ descriptor zero "wav"; live
  /api/tunnel/control/apis carries the new conversion wording; legacy
  /bundle/merge still 302 -> page ?action=merge.
- Honest limit: the in-browser conversion itself was not click-exercised
  from this worker (no live-browser channel). The encoder is proven in
  node, the sniff on real corpus bytes, and the page loop mirrors the
  proven harness exactly.
