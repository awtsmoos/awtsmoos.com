//B"H

# Yom Tov Modes

Every festival gets its own soul. Shabbos Mode was the start — stillness as
design. Yom Tov Modes extends it: each Yom Tov brings its own palette, mood,
and voice, computed from a real Hebrew calendar (no APIs, no network).

## The modes

| Mode | Festival | Freeze? | Soul |
|------|----------|---------|------|
| `pesach` | Pesach | yes | Stark, clean, unleavened — matzah-white, no clutter |
| `sukkos` | Sukkot, Shemini Atzeret, Simchat Torah | yes | Airy, joyful, open sky — lulav green |
| `shavuos` | Shavuot | yes | Lush, harvest — floral green, wheat gold |
| `yamim-noraim` | Rosh Hashanah, Yom Kippur, Tzom Gedaliah | yes | Solemn, deep, quiet — tekhelet dark |
| `chanukah` | Chanukah (8 days) | no | Luminous dark — menorah gold on night blue |
| `purim` | Purim, Shushan Purim | no | Joyful — wine and gold, tasteful |
| `solemn` | Fast days (10 Tevet, 17 Tammuz, 9 Av, Taanit Esther) | no | Subdued grey quiet |
| `minor` | Tu B'Shevat, Tu B'Av, Lag BaOmer | no | Gentle gladness |

Freeze days also carry `.shabbos-mode`, so the sibling stillness stylesheet
applies (no motion, no interactive chrome, everything expanded). The Yom Tov
theme then re-tints the palette variables and adds the holiday's mood.
Theme-only days get a standalone beautiful surface — fully interactive.

Chol HaMoed gets the festival's theme with no freeze. Erev Yom Tov gets an
offer banner ("the festival approaches").

## The calendar

`calendar.mjs` implements the Hebrew calendar from first principles — molad
plus the four dechiyot (molad zaken, lo ADU Rosh, gatarad, betutkafot) — and
Rata Die conversions for Gregorian dates. Verified:

- 6/6 Rosh Hashanah anchors (5783–5788) match known dates exactly
- 400-year sweep (5600–6000): every year length valid (353/354/355/383/384/385),
  Rosh Hashanah never on Sun/Wed/Fri
- Pesach 5785, Yom Kippur 5786, Chanukah 5786, Purim 5786, Shavuot 5786 all match

`holidays.mjs` enumerates every Yom Tov/fast/minor day per Hebrew year, with
correct Diaspora/Israel variants (default: diaspora), nidche/mukdam fast
postponements, and erev detection.

## Usage

```js
import { yomTovAtDate, renderYomTovPage, getYomTovWindow } from "./index.mjs";
import { sunsetUTCms } from "../shabbos-mode/times.mjs";

// What is today?
const entry = yomTovAtDate(new Date(), { diaspora: true });
if (entry) {
  const html = renderYomTovPage(pageHtml, entry, {
    lat: 31.7683, lon: 35.2137, utcOffsetMin: 180,
  });
}

// Sunset-aware window (for the client / scheduling)
const win = getYomTovWindow({ lat, lon, utcOffsetMin, sunsetUTCms });
// -> { current, next, nextInDays, jewishRD, inYomTov }
```

Client: `yomtovClientScript(opts)` embeds the calendar verbatim via
`toString()` — server and browser can never drift. Reads config from
`window.AWT_YOMTOV` or `<html data-yomtov-*>`.

## Design principle

A Yom Tov page is not a degraded page. Each festival is designed, not
decorated: Pesach is stark because freedom is stark; Chanukah glows because
a little light pushes away darkness. The medium carries the meaning.
