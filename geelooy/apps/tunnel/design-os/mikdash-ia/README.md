//B"H
# Mikdash IA — Beis Hamikdash Information Architecture

The site as an ascent: **Shaar → Azarah → Heichal → Kodesh HaKodashim**.
Going deeper = going holier = less chrome, more focus.

## Quick start

```js
import { mikdash } from "./index.mjs";

const m = mikdash("/heichelos/ikar/series/tanya/post/abc123");
console.log(m.level.name);        // "Kodesh HaKodashim"
console.log(m.depth);             // 4
console.log(m.kavanahRequired);    // true
console.log(m.tokens.background); // "#f3ecd9"
```

## Modules

| File | Purpose |
|------|---------|
| `levels.mjs` | The 4 levels: contracts, visual language, chrome budgets, `isAscent` |
| `kodeshRegistry.mjs` | Curated registry: which series/posts dwell in the Kodesh HaKodashim |
| `mapper.mjs` | `classify(url)` → level id; `depthOf`, `toPath`, `isAscentUrl` |
| `navigator.mjs` | `ascentPath`, `renderBreadcrumbs`, `levelHomeUrl`, `kodeshReturnPath` |
| `themes.mjs` | Per-level constraint-DSL bundles + token tables + `themeCssVars` |
| `kavanah.mjs` | Kavanah gate: `requiresKavanah`, `renderKavanahGate`, session pass |
| `index.mjs` | `mikdash(url)` — the whole context in one call |

## The kavanah gate

Kodesh HaKodashim URLs require intention to enter:

```js
import { requiresKavanah, renderKavanahGate } from "./kavanah.mjs";

if (requiresKavanah(url) && !passedKavanah(url, sessionStorage)) {
  document.body.innerHTML = renderKavanahGate({
    title: post.title,
    continueUrl: url + "?entered=1",
    returnUrl: "/heichelos",
  });
}
```

One breath, one tap, once per teaching per session. Never a paywall, never a nag.

## Curating the Kodesh HaKodashim

Edit `kodeshRegistry.mjs`:

```js
export const KODESH_SERIES = [
  "seferHamaamarim5666",
  "tanya",
  // add series slugs here
];
export const KODESH_POSTS = [
  // add exact post IDs here
];
```

Seed: Hemshech 5666, Tanya. Never remove without Yaakov's word.

## Themes + the constraint solver

Each level's visual contract is a constraint-DSL bundle the Design OS
can solve:

```js
import { themeDsl } from "./themes.mjs";
import { design } from "../constraints/index.mjs";

const solved = design(themeDsl("kodesh"));
console.log(solved.values["title.fontSize"]); // "81px" (4.5 × 18px)
console.log(solved.values["body.maxWidth"]);  // "30em"
```

Or use tokens directly for server rendering:

```js
import { themeCssVars } from "./themes.mjs";
// <style>${themeCssVars("heichal")}</style>
// then: <body data-mikdash-level="heichal">
```

## Tests

```sh
node tests/run.mjs   # 42 tests, must all pass
```

## Design notes

- Unknown URLs default to **Azarah** — public courtyard, never wrongly
  promoted into the Heichal.
- The kodesh registry **outranks** all other classification.
- Chrome budgets shrink with sanctity: 10 → 8 → 3 → 1.
- All theme bundles enforce WCAG contrast (AA min, AAA for deep levels).
