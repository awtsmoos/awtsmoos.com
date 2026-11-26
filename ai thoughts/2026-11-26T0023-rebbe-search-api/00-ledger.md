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

## 2026-11-26 (later) - CONVERSION FREEZE fixed + PROVEN in a real browser (Hai screenshot report; rollback backup/pre-rebbe-convert-stall-20261126)

- Hai screenshot (Android, 5726 Kislev 19 bundle, ?action=merge): status stuck on
  "Converting 1 of 25: BH_001_Nigun 1.mp3", progress bar empty, never advancing.
- CDP diagnosis (headless Chrome 157, harness /tmp/rebbe-diag/drive.mjs adapted from the
  mw-shliach r8-drive2.mjs rig; log convert-stall-fix-evidence/diag1.log):
  all 25 tracks fetched in ~25s; all 25 are true MP3 (ID3) but the lossless join threw
  (strict Xing/VBR rules) so the page fell back to conversion; track 1 DECODE took 7.3s -
  then encodeTrack, a fully SYNCHRONOUS lamejs loop, blocked the main thread for ~114s
  (Runtime.evaluate timed out 3x30s; zero repaint, zero progress). Per-track-only progress
  made it indistinguishable from dead. ~5x realtime => a 6.1h bundle = over an hour of
  frozen-looking screen on a phone.
- Fix (commit 4ffb6c1b1, geelooy/api/rebbe/lib/page.js only): encodeTrack is now async -
  yields every ~200ms and reports per-block progress ("Converting N of 25: name - 47% -
  MP3 so far 3.2 MB"); fetch streams with byte progress + 60s inactivity watchdog
  (AbortController, falls back to the alternate URL, then errors); format sniffing reads
  only the first chunk of each file; conversion streams per track when the bundle is not
  all-MP3 (no 181MB preload); stage timeouts (encoder load 30s, decode 180s, join 120s);
  Skip-this-track button (decode/fetch/encode all interruptible); Retry button; global
  error/unhandledrejection handlers surface failures in the status line. Tests 9/9 PASS.
- Browser proof (same harness, live production):
  * Hai exact bundle: fetch phase shows per-file MB progress; track 1 decoded in 4.8s and
    its encode status climbed 1% -> 100% with the bar moving and ZERO CDP poll timeouts;
    track 2 reached 68%+ with cumulative output growing to 12.4 MB before the run was
    stopped (evidence: verify-big.log).
  * Small bundle END-TO-END (5713 Iyar 18, Lag BOmer rally - 3 tracks that are really
    Ogg/Opus under .mp3 names, 586s): converted fully in the browser, status
    "Merged MP3 ready - 3 of 3 files converted and combined (586 seconds)", download
    completed: 7,037,388 bytes; frame scan validates 22,450 MPEG frames, 0 bad, exactly
    586.4s at 96 kbps mono 44.1kHz (evidence: verify-small.log, final.png,
    small-bundle-merged-proof.mp3).

## 2026-11-26 (later) - WEBCODECS media-encoder conversion path (Hai ruling: MP3 encoding should use the media encoder APIs; rollback backup/pre-rebbe-webcodecs-20261126, commit 9aea9f76c)

- CODEC SUPPORT, probed live in headless Chrome 157.0.8103.78 on the real origin
  (60 AudioEncoder mp3 combos: 6 sample rates x 2 channel counts x 5 bitrates):
  AudioEncoder "mp3" is NOT supported in ANY combo. Encode support found: opus only
  (aac/flac encode also unsupported). AudioDecoder IS supported: mp3, opus (44.1k
  and 48k), aac. Per the ruling's own terms, the deliverable stays a single MP3 -
  no silent AAC/Opus output - so on this browser the page falls back to lamejs,
  and the WebCodecs path activates automatically on any browser that does offer
  MP3 encoding.
- Implementation (geelooy/api/rebbe/lib/page.js only; tests 10/10 incl. a new
  WebCodecs-wiring test): convertToMp3 is now a dispatcher. probeWebCodecs()
  feature-detects via AudioEncoder/AudioDecoder.isConfigSupported and publishes
  the verdict on window.__rebbeConvert (engine + reason + full support matrix).
  WebCodecs path: in-page demuxers (splitMp3Frames - ID3v2 skip + MPEG frame
  walk; demuxOggOpus - page walk, packet stitching, OpusHead as decoder
  description, TOC-derived packet timestamps) feed EncodedAudioChunks into
  AudioDecoder; decoded AudioData streams straight into ONE shared
  AudioEncoder (mp3, 128k stereo / 96k mono), recreated only on a rate/channel
  change, with timestamp re-basing across tracks, queue backpressure, and the
  same progress / watchdogs / Skip / Cancel / visible-error discipline as the
  fallback. Any un-demuxable format or missing decoder throws FallbackToLamejs
  and the bundle restarts cleanly through the unchanged async lamejs path
  (renamed convertWithLamejs). Demuxers + probe are exposed on
  window.__rebbeWebCodecs for browser-level proof.
- Browser proof (CDP harness, live production; evidence in webcodecs-evidence/):
  * WebCodecs DECODE half on real files, via the page's own demuxers:
    5713 track 1 (Ogg/Opus misnamed .mp3): 3,899 packets demuxed = 78.0s vs
    manifest 77.98s; AudioDecoder(opus) emitted 3,899 AudioData = 78.0s, 0 errors.
    5726 Kislev 19 track 1 (true MP3, 577.66s): splitMp3Frames found 24,069
    frames = 577.7s; AudioDecoder(mp3) emitted 24,069 outputs = 577.7s, 0 errors.
    Fetch+demux+decode wall time ~11s per track incl. network - native decode
    is not the bottleneck.
  * Fallback END-TO-END on the new build (5713 Lag B'Omer, 3 Opus tracks):
    marker engine=lamejs with the recorded reason; "Merged MP3 ready - 3 of 3
    files converted and combined (586 seconds)"; download 7,037,388 bytes;
    frame scan 22,450 frames, 0 bad, 586.4s implied - identical numbers to the
    previous build's proof. Heap peaked ~94MB mid-convert, 10MB after.
  * Hai's 5726 bundle on the fallback: join attempted then declined as before;
    track 1 (577.7s) converted in ~36s (~16x realtime this run; the frozen-build
    diagnosis measured ~5x under heavier contention), track 2 advancing with
    output at 11.6MB before the observation window ended (verify-big.log).
- UNPROVEN, stated plainly: the WebCodecs ENCODE half cannot be exercised in
  this browser (no MP3 encoder exists in it), and codec support on Hai's
  phone browser cannot be checked from here - the page probes his browser at
  runtime and the status/marker report which engine ran. WebCodecs encode
  speed (x realtime) is therefore unmeasured; only the decode half's speed
  is proven.

## 2026-11-26 (later) - BACKGROUND conversion: worker + wake lock + OPFS resume + notifications (Hai ruling: conversion must work in the background, with notifications; rollback backup/pre-rebbe-background-20261126, commit d5ff991b1)

- Architecture (geelooy/api/rebbe only; tests 14/14 incl. 4 new): the whole
  conversion pipeline moved off the main thread into a DEDICATED WORKER
  (lib/convert-worker.js, served at /api/rebbe/bundle/worker.js). The shared
  engine (demuxers, Ogg muxer, resampler, PCM packing) was extracted to
  lib/engine.js as one source string evaluated in BOTH the page (where it
  remains the window.__rebbeWebCodecs observability surface) and the worker -
  no code duplication across the boundary. The worker pipeline is driven by
  codec output callbacks and queue backpressure (ondequeue events with a
  backstop poll), never by progress timers, so a hidden tab's timer
  throttling cannot stall it. Fetch + demux + AudioDecoder -> resample ->
  AudioEncoder(opus) -> muxer, all in the worker; the page only renders
  progress and saves the final Blob.
- WAKE LOCK: the page requests a screen wake lock at conversion start,
  re-acquires on visibilitychange->visible while running, releases at the
  end; state published in window.__rebbeBackground / __rebbeConvert.background
  (headless Chrome reports wakeLock 'error' - no display to lock; the field
  reports honestly on real devices).
- RESUME: at every track boundary the worker drains the encoder, page-aligns
  the muxer (new flushPage/takeParts), and persists that track's Ogg pages to
  OPFS (sync access handles) as track-N.bin plus meta.json {done, skipped,
  muxerState (serial/seq/granule), outFrames, totalSeconds}. The muxer learned
  to resume from saved state WITHOUT rewriting OpusHead/OpusTags, continuing
  the same Ogg stream. A fresh worker after reload/kill resumes at the next
  unfinished track; finished tracks are never re-fetched or re-encoded. A
  completed-but-unsaved conversion is offered as "Download ready file"
  (worker 'assemble' from the stored parts). Store cleared on ack-saved and
  on Cancel. Skip now rolls the muxer/encoder back to the track boundary, so
  a skipped track contributes nothing (the main-thread build kept partial
  audio). Worker heartbeats every 10s; the page watchdog (45s silence)
  offers Retry, which respawns the worker and resumes from OPFS.
- NOTIFICATIONS: service worker lib/service-worker.js at /api/rebbe/sw.js
  (scope /api/rebbe/; notificationclick focuses or opens the bundle page; NO
  fetch handler - downloads are never intercepted). Permission is requested
  on the merge-button gesture; auto-started runs (?action=merge) instead get
  an "Enable notifications" button. While hidden: a progress notification at
  most once per track (tag-replaced), a completion notification, and an
  error notification. Denial respected silently.
- Browser proof (CDP harness, live production, Chrome 157; evidence in
  webcodecs-background-evidence/):
  * (a) Small bundle (5713 Lag B'Omer, 3 Opus tracks) END-TO-END THROUGH THE
    WORKER: marker engine=webcodecs-opus, background {worker:true,
    serviceWorker:true, resume doneTracks 3/3}, "Merged Opus ready - 3 of 3
    (586 seconds, native media encoder in a background worker)"; download
    7,118,862 bytes; decode-back 29,322 packets / 586.4s / 0 errors; Node Ogg
    validation: 737 pages, 0 bad CRCs, seq OK, granule monotonic to exactly
    586.4s, EOS present (small-bundle-merged-proof.opus).
  * (b) BACKGROUND CONTINUATION: page hidden via decoy-target activation at
    ~14s (document.hidden=true, visibilityState=hidden); while hidden the
    status advanced 43% -> 60% -> 69% -> 82% -> 94% on track 2 (bar 48% ->
    65%), then completed all tracks and reached READY at 35.2s, still
    hidden; validation identical (run-bg.log).
  * (c) RESUME: page reloaded at 119s with doneTracks=1 persisted; the new
    page/worker resumed directly at "Converting 2 of 3" with "Opus so far
    1.1 MB" (the saved track-1 bytes in the continued stream - track 1 NOT
    redone), finished "resumed from progress saved on this device", final
    file byte-size identical to the uninterrupted runs (7,118,862) and
    validated (29,322 packets, 586.4s, 0 errors) (run-resume.log).
  * (d) NOTIFICATIONS: with permission granted via CDP, the SW registration
    (scope https://awtsmoos.com/api/rebbe/) is active and
    registration.showNotification delivered (getNotifications -> 1);
    __rebbeBackground.serviceWorker=true, notifications='granted'
    (run-notify.log). One transient seen: showNotification before the SW
    finished activating throws - the page's notify path is try/caught and
    only fires during conversions, long after activation.
- UNPROVEN from here, stated plainly: the real Android notification shade,
  the OS wake-lock behavior on Hai's phone, and the exact OS tab-kill timing
  on Android Chrome cannot be exercised headless; what is proven is that the
  pipeline has no main-thread dependence, continues while the page is
  hidden, and loses nothing on a full page reload. Hai's bundle (5726) was
  not re-run this round; the 5713 proofs exercise the identical code path.
