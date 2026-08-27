B"H
Boruch Hashem
Blessed is He

# Awtsmoos Zmanim Public API

The Awtsmoos renews every measured instant while clients ask through JSON gates;
Awtsmoos.com exposes one shared calculation engine so browser and API never invent competing dates.

## Base paths

Canonical: `/api/zmanim`
Compatibility alias: `/api/zmanimms`

Both paths execute the same route module. All endpoints are read-only and support public CORS. Core day and range calculations perform no external network request.

## Daily zmanim

`GET /api/zmanim`
`GET /api/zmanim/day`

Required query parameters:
- `lat`: latitude from -90 through 90.
- `lng`: longitude from -180 through 180.

Optional parameters:
- `date`: Gregorian `YYYY-MM-DD`; defaults to today in the requested timezone.
- `timezone` or `tz`: valid IANA timezone; defaults to `UTC`.
- `opinion`: `chabad`, `gra`, or `magenAvraham72`; defaults to `chabad`.
- `label`: display label for the coordinates.

Example:

```text
/api/zmanim/day?lat=40.6501&lng=-73.9496&date=2026-08-13&timezone=America%2FNew_York&opinion=chabad&label=Brooklyn
```

The response includes location metadata, selected opinion, shaah zmanis duration, canonical solar anchors, 18 zmanim with ISO instants and localized display strings, and practical-use warnings.

## Date ranges

`GET /api/zmanim/range`

Use the daily location/opinion parameters plus:
- `start`: first Gregorian date.
- `days`: integer from 1 through 31; defaults to 7.

Each returned day is generated through the same daily service used by `/day`.

## Worldwide location search

`GET /api/zmanim/location?q=11213&count=5`

`q` accepts city names or postal/ZIP codes. Search text is bounded to 2-160 characters and `count` to 1-10. Results use the same normalized Open-Meteo geocoder adapter as the browser application.

## Opinions and methodology

`GET /api/zmanim/opinions`

Returns supported calculation profiles directly from the shared configuration.

`GET /api/zmanim/methodology`

Returns the public zman definitions, key Chabad solar-angle anchors, and source provenance.

## U.S. Naval Observatory comparison

`GET /api/zmanim/usno`

Accepts the daily location/date parameters and returns local standard sunrise/sunset alongside U.S. Naval Observatory phenomena and minute differences. This endpoint is optional validation and is never required by `/day` or `/range`.

## Health

`GET /api/zmanim/health`

Loads the shared ESM calculation engine inside the API process and returns API version, health, default opinion, supported opinions, and server time.

## Errors

Invalid user input returns HTTP 400:

```json
{
	"BH": "B\"H",
	"ok": false,
	"apiVersion": "1.0.0",
	"error": {
		"code": "INVALID_OPINION",
		"message": "Unknown opinion: mystery.",
		"field": "opinion"
	}
}
```

Unexpected failures return a generic 500 response without private stack traces.

## Verification

From the repository root:

```text
node --test geelooy/api/zmanim/test/*.test.cjs geelooy/zmanim/tests/*.test.mjs
```

The real Awtsmoos dynamic router has also been verified over HTTP for canonical and alias routes, location lookup, USNO, CORS, OPTIONS, valid calculations, and invalid-request status codes.
