B"H
Boruch Hashem
Blessed is He

# Awtsmoos Zmanim Public API

The Awtsmoos renews every measured instant while clients ask through JSON, comparison, and HTML gates;
Awtsmoos.com exposes one shared calculation engine so browser, API, and embed never invent competing dates.

## Base paths

Canonical: `/api/zmanim`
Compatibility alias: `/api/zmanimms`

Both paths execute the same read-only route module with public CORS. Daily and comparison calculation itself requires no external network request.

## Daily zmanim

`GET /api/zmanim`
`GET /api/zmanim/day`

Required: `lat` and `lng`.

Optional:
- `date`: Gregorian `YYYY-MM-DD`; defaults to today in the requested timezone.
- `timezone` or `tz`: IANA timezone; defaults to UTC.
- `opinion`: one supported primary calculation profile; defaults to `chabad`.
- `label`: display label.

The response contains location/timezone, one opinion, shaah zmanis, solar anchors, 18 canonical zmanim with ISO/local displays, and warnings.

## Multi-opinion comparison

`GET /api/zmanim/compare`

Uses the same location/date/timezone parameters as `/day` and adds:
- `opinions=all` to calculate every shared supported profile.
- `opinions=id1,id2,...` to calculate an explicit ordered subset.
- `opinion=id` to request the primary profile inside that selected set.

Unknown selected opinion ids return HTTP 400. With no `opinions` parameter, `/compare` returns the validated primary opinion as a one-column comparison instead of silently changing it.

The comparison response deduplicates shared date/location/solar anchors and returns `calculations`, one serialized zmanim set per selected opinion.

## Range and location

`GET /api/zmanim/range`

Uses daily parameters plus `start` and `days` from 1 through 31.

`GET /api/zmanim/location?q=11213&count=5`

Search accepts city names and postal/ZIP codes through the same geocoder adapter as the browser.

## Presentation and embeds

`GET /api/zmanim/options`

Returns the exact browser-supported view, sky, theme, density, motion, section choices, defaults, named embed presets, and JSON day/comparison endpoints.

`GET /api/zmanim/embed`

Returns standalone semantic `text/html` generated from the same calculation services. Add `opinions=all` or a comma-separated subset to render a horizontally scrollable comparison matrix. See `EMBEDS.md`.

## Calculation metadata

`GET /api/zmanim/opinions`
`GET /api/zmanim/methodology`

These endpoints expose the canonical shared opinion universe, definitions, angles, and source provenance.

## Independent comparison and health

`GET /api/zmanim/usno`
`GET /api/zmanim/health`

USNO comparison is optional and external; `/day`, `/compare`, and `/range` never depend on it.

## Errors and verification

Invalid input returns HTTP 400 with a bounded error. Unexpected failures return a generic 500 without private stack traces. HTML embeds return escaped HTML error documents with equivalent status semantics.

```text
node --test geelooy/api/zmanim/test/*.test.cjs geelooy/zmanim/tests/*.test.mjs
```

Also verify `/day`, `/compare`, `/options`, `/embed`, CORS/OPTIONS, invalid selected opinions, and comparison HTML over real HTTP.
