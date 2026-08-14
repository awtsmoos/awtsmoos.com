B"H
Boruch Hashem
Blessed is He

# Awtsmoos Zmanim

The Awtsmoos renews every instant beneath the turning sky;
Awtsmoos.com reveals the measured day while the Source remains infinitely high.

## Daily experience

`/zmanim` is a dependency-free, mobile-first halachic-times application with a daily-dashboard UX rather than only a table of timestamps.

The page includes:
- Worldwide city and postal/ZIP search.
- A custom owned Gregorian calendar Web Component.
- Previous, Today, and Next day navigation.
- Civil and Hebrew date display.
- Alter Rebbe / Chabad as the primary calculation profile.
- Gra sunrise-to-sunset and fixed-72-minute Magen Avraham alternatives.
- Descriptive shita cards plus an accessible native select fallback.
- A next-zman hero with a live countdown when viewing today in the selected timezone.
- Automatic advancement when the currently displayed next zman passes.
- A visual five-anchor day timeline from alos through tzeis.
- Passed, next, upcoming, selected-date, and unavailable card states.
- 18 detailed zmanim cards.
- Copy-link and copy-all-zmanim actions.
- Fully restorable share URLs containing date, opinion, coordinates, timezone, and a bounded location label.
- U.S. Naval Observatory rise/set validation when reachable.
- Explicit high-latitude unavailable states and practical-use cautions.

## Alter Rebbe / Chabad method

The default profile uses the published Chabad calculation anchors:
- Alos HaShachar: 16.9° solar depression.
- Misheyakir: 10.2°.
- Practical sunrise/sunset: standard 0.833° horizon correction.
- Internal hanetz amiti / shkiah amitis seasonal-hour anchors: 1.583°.
- Tzeis: 6°.
- Shabbos / Yom Tov end: 8.5°.

The internal true-rise/true-set anchors are calculation vessels and are intentionally distinct from the practical sunrise/sunset displayed to users.

## Calculation architecture

The browser calculation modules under `js/domain/` and `js/config/` are the canonical source of astronomical and halachic math.

The public `/api/zmanim` API dynamically imports those exact modules from the CommonJS server tree. Browser and API therefore share one calculation engine instead of maintaining duplicate formulas.

Worldwide place lookup uses the Open-Meteo geocoder. Solar-angle calculations are local and based on NOAA-published solar-position equations. USNO is a separate government cross-check and never a dependency of core daily/range calculations.

## Public API

Canonical API: `/api/zmanim`
Compatibility alias: `/api/zmanimms`

Available API resources include daily zmanim, bounded ranges, worldwide location lookup, opinions, methodology, USNO comparison, and health. See `geelooy/api/zmanim/README.md` for the complete contract.

## Practical use

Calculated zmanim contain unavoidable astronomical and methodological uncertainty. The interface explicitly encourages a safety margin rather than relying on the final minute. Local custom and practical questions require a competent rav, especially at unusual latitudes.

## Verification

From the repository root:

```text
node --test geelooy/zmanim/tests/*.test.mjs geelooy/api/zmanim/test/*.test.cjs
```

The feature is also verified through the real Awtsmoos dynamic server and a real Chrome session, including responsive widths, URL hydration, interactions, network responses, and console state.
