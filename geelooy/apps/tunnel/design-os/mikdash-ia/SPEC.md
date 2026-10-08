//B"H
# Beis Hamikdash Information Architecture — SPEC

## The vision

Hashem gave the proportions: **Shaar** (gateway), **Azarah** (courtyard),
**Heichal** (sanctuary), **Kodesh HaKodashim** (holy of holies).
That is information architecture.

awtsmoos.com is restructured as an ascent. Going deeper into the site
means going holier: chrome falls away, focus deepens, warmth deepens.
The visitor never gets lost — every page knows its level, shows the way
in, and honors the way back out.

## The four levels

| # | Level | Hebrew | Site equivalent | Chrome budget |
|---|-------|--------|-----------------|---------------|
| 1 | Shaar | שער | Homepage, about, contact — orientation only | 10 |
| 2 | Azarah | עזרה | Browse: series indexes, discover, search, categories | 8 |
| 3 | Heichal | היכל | The teaching itself: posts, articles, translations | 3 |
| 4 | Kodesh HaKodashim | קודש הקודשים | The deepest teachings (curated registry) | 1 |

### Level contracts

**Shaar (1).** Welcoming, bright, generous. Every page offers at least one
clear path inward. No deep content lives here — only orientation.

**Azarah (2).** Open, public, scannable. Many doors visible at once.
Filtering and search visible, never hidden. Two taps max to any teaching.

**Heichal (3).** One teaching per page. The sefer reader rules apply:
4x body text, English below Hebrew (never side by side), phrase rule,
warm paper (#f7f1e3), dark ink (#2b2118). No autoplay, no popups, ever.

**Kodesh HaKodashim (4).** The deepest teachings — Hemshech 5666, Tanya,
and Yaakov's curated additions. Entry requires **kavanah**: a quiet
interstitial (one breath, one tap), passed once per teaching per session.
Inside: no comments, no likes, no share buttons, no related posts, no
navigation chrome except a single quiet return path. Nothing may demand
attention except the text. Larger type than Heichal (4.5x), narrower
measure (30em), candle-warmth.

## Classification

`mapper.mjs` → `classify(url)`:

1. **Kodesh registry first.** `kodeshRegistry.mjs` names series slugs,
   post IDs, and path patterns that dwell in the fourth level. The
   registry outranks everything — curation is deliberate.
2. A `/post/<id>` page is **Heichal**.
3. A `/series/<slug>` index is **Azarah** (browse).
4. Known browse prefixes (`/heichelos`, `/discover`, `/search`, …) are **Azarah**.
5. `/`, `/about`, `/contact` are **Shaar**.
6. Unknown paths default to **Azarah** — never wrongly promote into
   the Heichal.

## Ascent navigation

`navigator.mjs`:

- `ascentPath(url)` → Shaar → … → current, each crumb carrying Hebrew
  and English names plus its level's home URL.
- `renderBreadcrumbs(url)` → accessible `<nav>` with `aria-current`.
- `levelHomeUrl(level, path)` → Azarah prefers the enclosing series
  index when inside one.
- `kodeshReturnPath(url, cameFrom)` → the single quiet way back out.

## Themes

`themes.mjs`: each level has a **constraint-DSL bundle** (parseable by
`design-os/constraints`) and a **token table** (colors, chrome list).

Sanctity gradient (solved values):
- Shaar: body 18px, title 3x, measure 42em, bright `#fdfbf5`
- Azarah: body 16px, card titles 1.3x, measure 64em (grid), `#faf6ec`
- Heichal: body 16px, title **4x**, measure 34em, warm paper `#f7f1e3`
- Kodesh: body 18px, title **4.5x**, measure **30em**, `#f3ecd9`, `chrome.count = 0`

All levels enforce WCAG contrast (AA minimum, AAA for kodesh/heichal
body text — the kavanah of readability).

`themeCssVars(level)` emits `:root[data-mikdash-level]` custom
properties for direct `<style>` use.

## Kavanah gate

`kavanah.mjs`:

- `requiresKavanah(url)` — true only for Kodesh HaKodashim.
- `renderKavanahGate({title, continueUrl, returnUrl})` — still, warm,
  minimal interstitial HTML. Title is escaped. Enter control is a 44px
  touch target.
- `passedKavanah(url, storage)` / `KAVANAH_CLIENT_JS` — sessionStorage
  records the pass; the gate shows once per teaching per session.

## Integration

```js
import { mikdash } from "./index.mjs";
const m = mikdash("https://awtsmoos.com/heichelos/ikar/series/tanya/post/abc");
// m.level.id           → "kodesh"
// m.trail              → 4 crumbs, Shaar → Kodesh
// m.breadcrumbsHtml    → accessible nav
// m.themeDsl           → constraint bundle for the solver
// m.tokens             → { background, ink, accent, chrome: [...] }
// m.cssVars            → :root custom properties
// m.kavanahRequired    → true
// m.returnPath         → quiet way back
```

The theme DSL bundles feed the Design OS `design()` pipeline
(parse → validate → solve); the tokens feed server-side rendering.

## Curation

`KODESH_SERIES`, `KODESH_POSTS`, `KODESH_PATTERNS` in
`kodeshRegistry.mjs` are curated by Yaakov. Seed entries: Hemshech 5666
series, Tanya. Add entries freely; never remove without his word.
