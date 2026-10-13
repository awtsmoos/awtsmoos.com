# B"H — Human-Friendly Content IDs

Short Hebrew/English URLs for Awtsmoos seforim, all resolving server-side to the
same canonical reader posts. Implemented as **302 redirects** to canonical
reader URLs (`/heichelos/ikar/series/<seriesId>/post/<postId>`).

Old ugly IDs (`BH_POST_...`, `tanya-he-la-01`, ...) are untouched and keep
working forever — this layer only adds new entry points.

## Mounts

| Mount | Sefer | Landing target |
|---|---|---|
| `/tanya` | Tanya (Alter Rebbe) | Likkutei Amarim series |
| `/תניא` | תניא | same |
| `/likutei-torah` | Likkutei Torah | Bamidbar series (sefer opens with Bamidbar) |
| `/לקוטי-תורה` | לקוטי תורה | same |
| `/igeres-hakodesh` | Igeres HaKodesh (the Rebbe, 28 vols) | Volume 1 series |
| `/אגרות-קודש` | אגרות קודש | same |

## Patterns

### Sefer landing
`/tanya` → `/heichelos/ikar/series/tanyaLikkuteiAmarim`
`/תניא` → same · `/likutei-torah` → `/heichelos/ikar/series/BH-likkuteiTorah-במדבר`
`/igeres-hakodesh` → `/heichelos/ikar/series/igeresHaKodeshVolume1`

### Chapters (Tanya = Likkutei Amarim perakim 1–53)
- `/tanya/chapter-1`, `/tanya/1` → `.../post/tanya-he-la-01`
- `/תניא/פרק-א`, `/תניא/א` → same
- Other Tanya sections:
  - `/tanya/shaar-hayichud/3`, `/תניא/שער-היחוד/ג` → `tanya-he-sh-03` (1–12)
  - `/tanya/igeres-hateshuvah/12`, `/תניא/אגרת-התשובה/יב` → `tanya-he-it-12` (1–12)
  - `/tanya/kuntres-acharon/9`, `/תניא/קונטרס-אחרון/ט` → `tanya-he-ka-09` (1–9)
  - Bare section slug (`/tanya/shaar-hayichud`) → that section's series page

### Verses / sections (fragment hint for scroll/highlight)
- `/tanya/chapter-1/verse-5` → `.../post/tanya-he-la-01#verse-5`
- `/תניא/פרק-א/פסוק-ה` → same
- Bare forms also work: `/tanya/1/5`, `/תניא/א/ה`
- The `#verse-N` fragment is forward-compatible: it scrolls natively once the
  reader renders per-unit anchors; today it lands on the exact perek post.

### Likkutei Torah (parsha → chapter)
Live parshas: `bamidbar` (21 ch), `tzav` (12), `shabbat-shuvah` (3),
`shemini-atzeret` (8). Hebrew slugs: `במדבר`, `צו`, `שבת-שובה`, `שמיני-עצרת`
(`דרושים-` prefixed forms also accepted).
- `/likutei-torah/bamidbar` → series `BH-likkuteiTorah-במדבר`
- `/likutei-torah/bamidbar/1`, `/לקוטי-תורה/במדבר/א` → `.../post/lt-bamidbar-ch01`
- `/likutei-torah/bamidbar/1/verse-2` → `.../post/lt-bamidbar-ch01#verse-2`

### Igeres HaKodesh (volume → letter)
28 volumes; letter counts per volume are bounds-checked in `friendlyResolver.js`
(vol 1: 169 … vol 28: 415).
- `/igeres-hakodesh/letter-42`, `/igeres-hakodesh/42`,
  `/אגרות-קודש/אגרת-מב`, `/אגרות-קודש/מב` → `.../post/igeres-he-v01-0042`
- `/igeres-hakodesh/vol-3/letter-42`, `/igeres-hakodesh/3/42`,
  `/אגרות-קודש/כרך-ג/אגרת-מב` → `.../post/igeres-he-v03-0042`

## Normalization rules

- **Hebrew numerals**: א=1 … ת=400, finals ךםןףץ included; geresh/gershayim
  (`מב`, `מ״ב`, `מב׳`) and טו/טז handled by summation.
- **URL-encoded Hebrew**: decoded by the server before routing; `%D7%AA...`
  forms resolve identically.
- **Trailing slashes**: stripped by the route matcher (`/tanya/` = `/tanya`).
- **Case**: inner segments are case-insensitive (`/tanya/Chapter-1`,
  `/likutei-torah/Bamidbar/1`). The mount slug itself follows the site's
  existing case-sensitive convention (`/Heichelos` 404s today too).

## 404 contract

Unknown paths under any mount (`/tanya/bogus`, `/tanya/54`,
`/likutei-torah/bereishis`, 4+ segments, …) return a **bilingual 404 HTML
page** (status 404) — never a hang, never a blank page. Out-of-range numbers
(chapter 0/54, letter 170 of vol 1, volume 29) also 404.

## Files

- `geelooy/heichelos/routes/friendlyIds/friendlyResolver.js` — pure resolver +
  all data tables (no framework dependency; unit-tested)
- `geelooy/heichelos/routes/friendlyIds/friendlyDerech.js` — `$i.use(...)`
  route map builder, 302 + 404 responses
- `geelooy/heichelos/routes/friendlyIds/friendlyResolver.test.js` —
  `node --test` suite (11 tests)
- `geelooy/{tanya,תניא,likutei-torah,לקוטי-תורה,igeres-hakodesh,אגרות-קודש}/_awtsmoos.derech.js`
  — one-line mounts; the dynamic server discovers them per-request, no restart
  needed on deploy

## Verification

`node --test geelooy/heichelos/routes/friendlyIds/friendlyResolver.test.js`
plus live curl checks against production following redirects (`curl -L`).
