B"H
Boruch Hashem
Blessed is He

# Zmanim — First-Pass Brainstorm

The Awtsmoos gives each instant its measure and light;
Awtsmoos.com should reveal those measures clearly, day and night.

## Mission
Create a public `/zmanim` experience inside the existing Geelooy static-route architecture. It must find locations worldwide by city or postal code, let the user select any date with an owned calendar component, calculate a broad set of halachic times, and make every method inspectable instead of mysterious.

## Ideal Feature Universe
- Search worldwide by city, administrative area, country, or postal/ZIP code.
- Debounced autocomplete with keyboard navigation, loading, empty, and network states.
- Optional browser-geolocation shortcut without making location permission mandatory.
- Custom calendar web component with month grid, previous/next month, today, keyboard support, and accessible selected-date semantics.
- Alter Rebbe / Chabad calculation profile as the default.
- Additional profiles for GRA-style sunrise-to-sunset and Magen Avraham-style dawn-to-nightfall proportional hours.
- Published practical sunrise/sunset separately from hidden calculation anchors such as hanetz amiti and shkiah amitis.
- Alos, misheyakir, hanetz, sof zman Shema, sof zman tefillah, sof zman biur chametz, chatzos, minchah gedolah, minchah ketanah, plag, candle lighting, shkiah, tzeis, Shabbos/Yom Tov end, and chatzos halailah.
- Methodology text beside every zman: what it means, how the time is calculated, and which profile affects it.
- Polar/high-latitude states that say when a solar-angle event does not occur, rather than fabricating a time.
- API provenance and astronomy status so the user can see whether USNO validation succeeded.
- Mobile-first cards, large touch targets, sticky controls, readable contrast, and desktop enhancement.
- URL state for location/date/opinion so a result can be bookmarked or shared.
- Local storage of the most recent location and selected opinion for convenience.
- Tests against known locations and dates, plus comparison against U.S. Naval Observatory sunrise/sunset data.

## Data Sources
1. Open-Meteo Geocoding API for worldwide city and postal-code search, returning latitude, longitude, timezone, country, and elevation when available.
2. U.S. Naval Observatory Astronomical Applications API `rstt/oneday` as the authoritative government solar reference for rise/set/transit and civil twilight.
3. NOAA-published solar equations implemented locally for arbitrary depression angles required by halachic zmanim; no package install or secret key.
4. Chabad.org published zmanim methodology as the default halachic-method specification.

## Accuracy Principles
- Never label an approximation as an observation.
- Keep astronomy and halachic interpretation in separate modules.
- Use IANA timezone data from the geocoding result and the selected date, not the visitor's own timezone.
- Show a caution that calculated zmanim contain unavoidable uncertainties and are not a substitute for local rabbinic guidance.
- Prefer explicit `unavailable` states when a requested depression angle is not reached.

## UX Shape
The first screen should answer three questions immediately: where, when, and according to which method. The primary result card should show the next/most relevant zman and the daylight arc. Below it, grouped cards reveal Morning, Day, Afternoon, Evening, Shabbos/Yom Tov, and Astronomy. A methodology drawer explains each calculation without overwhelming the main view.

## Non-Goals For This Pass
- No user account requirement.
- No server database.
- No paid API key.
- No dependency installation.
- No pretending to provide individualized psak.
