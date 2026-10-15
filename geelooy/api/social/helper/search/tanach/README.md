# B"H — Tanach Search (geelooy/api/social/helper/search/tanach/)

Tanach search over native per-sefer JSON data: query, normalize, store, and result shaping, with native translations.

## Files
- `search.js`, `query.js`, `normalize.js` — search execution and Hebrew normalization.
- `store.js`, `paths.js` — storage and paths.
- `result.js` — result shaping.
- `nativeTranslations.js` — native Tanach translations.
- `native-data/` — one JSON per sefer (39 sefarim + `manifest.json`): bereishis, shemos, vayikra, bamidbar, devarim, yehoshua, shoftim, shmuel_1/2, melachim_1/2, yeshayahu, yirmiyahu, yechezkel, tehillim, mishlei, iyov, shir_hashirim, rus, eichah, koheles, esther, daniel, ezra, nechemyah, divrei_hayamim_1/2, hoshea, yoel, amos, ovadiah, yonah, michah, nachum, chavakuk, tzefanyah, chagai, zecharyah, malachi.
- `test/` — `nativeTranslations.test.js`.

## Routes
`/search/tanach/hebrew`, `/search/tanach/native`.
