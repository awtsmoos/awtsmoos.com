B"H
Boruch Hashem
Blessed is He

# Zmanim Phase Two — UX + API Brainstorm

The Awtsmoos renews the measured sky while interface and API learn to agree;
Awtsmoos.com should make every zman useful to a person and reusable by every future vessel we see.

## Mission
Improve the existing `/zmanim` experience from a strong calculator into a polished daily companion, while exposing the entire calculation surface through a public `/api/zmanim` family and a compatibility alias `/api/zmanimms`.

## UX Possibility Universe
- Next-zman hero showing the upcoming halachic milestone and countdown.
- Daylight arc / visual timeline from alos through nightfall.
- Compact “today at a glance” strip for sunrise, Shema, chatzos, sunset, tzeis.
- Search results with location iconography, country/admin subdivision, coordinates and timezone.
- Recent places and pinned favorites stored locally.
- Stronger empty/loading/skeleton/error states.
- Quick “Today” action in the calendar area.
- Previous / next civil day actions beside the calendar.
- Date drawer that is compact on phones and spacious on desktop.
- Shita selector shown as descriptive segmented cards rather than only a native select.
- “Why this time?” expandable explanation directly on each zman card.
- Ability to copy a zman or all zmanim as text.
- Shareable URL that hydrates date, opinion and coordinates/location label.
- Sticky mobile action bar for place, date and opinion.
- Current-time progress through the halachic day.
- Relevant status badges: morning, passed, upcoming, unavailable.
- Localized timezone label and coordinates always visible but visually secondary.
- Strong Hebrew visual identity without making English scanning harder.
- Keep every key action thumb reachable at 320px.

## API Possibility Universe
- `GET /api/zmanim` — daily result by lat/lng/date/timezone/opinion.
- `GET /api/zmanim/day` — explicit daily alias.
- `GET /api/zmanim/range` — bounded multi-day results.
- `GET /api/zmanim/location?q=` — worldwide city/postal proxy.
- `GET /api/zmanim/opinions` — supported shitos and parameters.
- `GET /api/zmanim/methodology` — source/method descriptions.
- `GET /api/zmanim/health` — parser/runtime sanity and version info.
- `GET /api/zmanim/usno` — optional government rise/set comparison.
- `OPTIONS` support with public CORS.
- Structured validation errors with HTTP status.
- Stable response version field.
- ISO timestamps plus localized display strings.
- Metadata for whether an event is unavailable at high latitude.
- Bounded range length to prevent accidental abuse.
- Compatibility alias `/api/zmanimms/*` backed by the same route module.

## Architecture Principle
The browser and API must not own separate halachic math. The existing ESM domain modules beneath `geelooy/zmanim/js/` remain canonical. The CommonJS API mount dynamically imports those modules. API-specific code only validates request inputs, fetches location/USNO data, serializes Dates, and assembles HTTP responses.

## User Experience Principle
The page should feel like a beautiful daily instrument, not a list of timestamps. Important information must be visible immediately, but methodology must remain one tap away.
