B"H
Boruch Hashem
Blessed is He

# Awtsmoos Rebbe Sichos Search API

Machine-readable search over the same Archive.org sichos index the Rebbe
app (`/apps/rebbe/`) browses — by Hebrew month, day and year, with ranges
and keyword — plus bundle links an agent can hand straight to an end user.

Base: `/api/rebbe` · No auth · JSON · CORS `*`

## Endpoints

- `GET /api/rebbe/` — JSON descriptor (agent discovery)
- `GET /api/rebbe/docs` — human documentation page
- `GET /api/rebbe/health` — health
- `GET /api/rebbe/options` — years / months / days known to the archive
- `GET /api/rebbe/search` — search events (see below)
- `GET /api/rebbe/event?bucket=<item>&folder=<folder>` — one event's tracks
  (or `year=` instead of `bucket=`)
- `GET|POST /api/rebbe/bundle` — create a bundle from search params
- `GET /api/rebbe/bundle/data?id=` — bundle manifest JSON
- `GET /api/rebbe/bundle/page?id=` — user page: ZIP + merged MP3 in browser
- `GET /api/rebbe/bundle/zip?id=` — direct server ZIP (cap 300 files / 400 MB)
- `GET /api/rebbe/bundle/merge?id=` — direct server merged MP3 (tolerant
  lossless frame join; 422 when a segment is not really MP3 — some corpus
  files are Opus misnamed .mp3 — or MP3 profiles differ)

## Search params

`month`/`months` (1–12, 1=Tishrei), `monthFrom`/`monthTo`, `day`/`days`
(1–30), `dayFrom`/`dayTo`, `year`/`years` (Hebrew years), `yearFrom`/`yearTo`,
`q` keyword, `limit` (1–200, default 50), `offset`, `include=tracks`.

Example: `/api/rebbe/search?month=3&day=19` — all sichos of 19 Kislev.

## Bundles

`GET /api/rebbe/bundle?month=3&day=19` returns `{ bundleId, pageUrl, zipUrl,
mergeUrl, manifestUrl, eventCount, trackCount, totalBytes, truncated }`.
Give the user `pageUrl`: ZIP and merged MP3 are assembled **in the browser**
from the original Archive.org files, reusing the app's own `zip-store.js`
and lossless MP3 frame join (`mp3-join.js`) — nothing is re-encoded. For
mixed-format bundles the page also offers a **merged WAV** button (Web
Audio decode + re-encode), and `mergeDownloadUrl` is a server merged MP3
whose tolerant frame joiner resyncs past isolated corrupt headers that the
strict browser joiner rejects. `zipUrl` is the server-assembled fallback
for smaller bundles. Bundle ids
are stateless (the id encodes the search), permanent, and capped honestly
at 120 events with a `truncated` flag — never silent.

## Data model

Events (a farbrengen / sicha gathering) come from the front end's immutable
Archive.org shards `months-1764928230` / `days-1764928230`; tracks, sizes
and durations come from each year item's Archive.org metadata — the exact
sources the front end uses, so API and app always agree.
