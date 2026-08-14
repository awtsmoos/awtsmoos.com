B"H
Boruch Hashem
Blessed is He

# Zmanim — Second-Pass Architecture and File Map

From hidden measure into visible line,
the Awtsmoos lets each module carry one design.

## Chosen Architecture
A dependency-free ES-module application served as the existing site's normal `/zmanim` static route. The feature owns its HTML, CSS, domain math, services, web components, rendering, and tests. Existing project files remain untouched.

## Data Flow
`LocationSearch` -> Open-Meteo geocoding result -> normalized location/timezone -> `SolarCalculator` -> raw solar events -> `ZmanimCalculator` + selected opinion -> grouped view models -> `ZmanimGrid`.

In parallel, `UsnoService` requests the same day's U.S. Naval Observatory rise/set data. Its result is shown as astronomy provenance and used in tests/runtime diagnostics; halachic-angle events remain locally computable even if that validation service is unavailable.

## File Graph
- `geelooy/zmanim/index.html` — semantic shell, search/date/opinion controls, results mount points, methodology section.
- `geelooy/zmanim/styles/tokens.css` — colors, spacing, type, radii, shadows, safe-area variables.
- `geelooy/zmanim/styles/layout.css` — mobile-first page layout, hero, controls, sections, responsive enhancement.
- `geelooy/zmanim/styles/components.css` — search, calendar, buttons, chips, cards, states, accessibility focus.
- `geelooy/zmanim/js/config/opinions.js` — immutable profiles and display labels.
- `geelooy/zmanim/js/config/zmanim.js` — zman definitions, explanations, grouping metadata.
- `geelooy/zmanim/js/domain/solar-equations.js` — NOAA-based declination/equation-of-time/hour-angle primitives.
- `geelooy/zmanim/js/domain/solar-events.js` — arbitrary solar-depression event resolver.
- `geelooy/zmanim/js/domain/timezone.js` — IANA-zone offset and local-date formatting helpers.
- `geelooy/zmanim/js/domain/zmanim-calculator.js` — pure halachic-time calculations from solar anchors.
- `geelooy/zmanim/js/services/geocoding-service.js` — worldwide city/postal search.
- `geelooy/zmanim/js/services/usno-service.js` — U.S. Naval Observatory one-day request and normalization.
- `geelooy/zmanim/js/components/calendar-component.js` — custom owned calendar web component.
- `geelooy/zmanim/js/components/location-search.js` — autocomplete controller and keyboard behavior.
- `geelooy/zmanim/js/components/zmanim-grid.js` — accessible cards and unavailable states.
- `geelooy/zmanim/js/components/methodology-panel.js` — calculation explanations and sources.
- `geelooy/zmanim/js/state/zmanim-store.js` — minimal observable application state and persistence.
- `geelooy/zmanim/js/app.js` — composition root only.
- `geelooy/zmanim/tests/solar-events.test.mjs` — astronomy primitives and edge cases.
- `geelooy/zmanim/tests/zmanim-calculator.test.mjs` — profile formulas and ordering invariants.
- `geelooy/zmanim/README.md` — source provenance, formulas, limitations, test instructions.

## Default Chabad / Alter Rebbe Profile
- Alos: solar center at -16.9°.
- Misheyakir: solar center at -10.2°.
- Published hanetz/shkiah: -0.833° center altitude.
- Hanetz amiti / shkiah amitis calculation anchors: -1.583°.
- Shaah zmanis: interval from hanetz amiti to shkiah amitis divided by 12.
- Sof Shema: +3 proportional hours from hanetz amiti.
- Sof Tefillah: +4.
- Sof Biur Chametz: +5.
- Chatzos: midpoint of true sunrise/true sunset.
- Minchah Gedolah: +6.5 proportional hours, with UI note about waiting 30 ordinary minutes where applicable.
- Minchah Ketanah: +9.5 proportional hours.
- Plag: +10.75 proportional hours.
- Tzeis: -6° evening solar altitude.
- Shabbos/Yom Tov end: -8.5° evening solar altitude.
- Candle lighting: 18 minutes before published shkiah as a general default, explicitly noting local customs can differ.

## Other Opinion Profiles
`gra`: proportional day from published sunrise to published sunset.
`magenAvraham`: proportional day from an alos anchor to a tzeis anchor; parameters exposed in profile metadata rather than hard-coded inside rendering.

## Verification Graph
1. Syntax-check every JS module.
2. Unit-test solar event ordering and known NYC date ranges.
3. Unit-test Alter Rebbe proportional-hour formulas.
4. Fetch a real geocoding result.
5. Fetch a real USNO one-day response outside the browser.
6. Start the existing local server without mail.
7. Open `/zmanim` in Chrome.
8. Search city and postal code.
9. Change calendar date and opinion.
10. Check mobile viewport for overflow, focus, and readable cards.
11. Compare displayed sunrise/sunset with USNO tolerance and investigate large deltas.

## Security / Privacy
No API keys, no secrets, no account data, and no location transmission unless the user performs a search or explicitly chooses browser geolocation. Search terms are URL-encoded. Remote failures are rendered as errors, never injected as HTML.
