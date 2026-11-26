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
- `GET /api/rebbe/bundle/page?id=` — THE download page: ZIP + merged MP3 + merged WAV, all assembled in the browser
- `GET /api/rebbe/bundle/zip?id=` — legacy link: 302 redirect to the bundle page (the server does no downloading)
- `GET /api/rebbe/bundle/merge?id=` — legacy link: 302 redirect to the bundle page with `action=merge`

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
Audio decode + re-encode). `zipUrl` and `mergeUrl` are the same page
focused on that action; opening one starts that download in the browser.
The server never downloads the audio — the legacy `/bundle/zip` and
`/bundle/merge` endpoints only 302-redirect to the page. Bundle ids
are stateless (the id encodes the search), permanent, and capped honestly
at 120 events with a `truncated` flag — never silent.

## Data model

Events (a farbrengen / sicha gathering) come from the front end's immutable
Archive.org shards `months-1764928230` / `days-1764928230`; tracks, sizes
and durations come from each year item's Archive.org metadata — the exact
sources the front end uses, so API and app always agree.
