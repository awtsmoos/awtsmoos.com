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
