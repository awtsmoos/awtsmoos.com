//B"H

# Hebrew-First Design System

The web is Latin-first. RTL is an afterthought. This is the inversion: **RTL is
the default, LTR is the opt-in mode.** Every component assumes right-to-left;
Latin content declares itself with `.latin-mode`, `[dir="ltr"]`, or `.latin`.

Part of the Awtsmoos Design OS (`geelooy/apps/tunnel/design-os/`). It plugs
into the constraint language in `../constraints/` — designers declare intent as
mathematical constraints, the solver finds values, this module generates CSS.

## Quick start

```js
import { hebrewFirst } from "./index.mjs";

const r = hebrewFirst("בְּרֵאשִׁית בָּרָא אֱלֹהִים"); // Genesis 1:1
// r.ok         — true when constraints solve
// r.analysis   — what the text needs (nikkud? taamim? mixed Latin?)
// r.bundles    — constraint bundles selected for this text
// r.values     — solved constraint values
// r.css        — generated Hebrew-first CSS
// r.warnings   — unmapped constraint paths (should be empty)
```

## The contract

1. **RTL default.** `:root { direction: rtl; }`. Every component inherits it.
   LTR subtrees opt in: `.latin-mode`, `[dir="ltr"]`.
2. **Logical properties only.** Generated CSS uses `margin-inline-start`,
   `padding-block`, etc. `inline-start` means *right* in the default context.
   No physical `margin-left`/`margin-right` is ever emitted.
3. **Bidi isolation.** Latin runs and digits inside Hebrew get
   `unicode-bidi: isolate` (`.latin`, `<bdi>`), so mixed text never reorders.
4. **Mark-safe typography.** Line height follows the marks:
   - plain Hebrew → 1.5
   - nikkud → 1.7
   - taamim → 1.9, plus vertical padding and `overflow: visible` — stacked
     cantillation marks are never clipped.
5. **Sacred-text guards.** Hebrew is never transformed (`text-transform: none`)
   and never hyphenated (`hyphens: none`).
6. **No-break rules.** Acronyms with gershayim (ד״ה) and maqaf-joined words
   (מֵהֹדּוּ־וְעַד־כּוּשׁ) get `white-space: nowrap` via `.he-acronym` / `.he-maqaf`.
7. **Font stacks by shaping quality.** Frank Ruehl CLM and David Libre position
   nikkud/taamim best; Noto Serif Hebrew is the cross-platform fallback;
   Ezra SIL covers rare taamim.

## Modules

| File | Purpose |
|---|---|
| `typography.mjs` | Unicode ranges (nikkud, taamim, sofit, gershayim, maqaf), font stacks, line-height policy |
| `analyzer.mjs` | `analyzeHebrew(text)` — detects marks, recommends bundles + line height |
| `rtl.mjs` | Direction system: `DEFAULT_DIRECTION = "rtl"`, logical-property helpers, the direction contract |
| `constraints.mjs` | 9 Hebrew-first constraint-DSL bundles (same shape as the shared library) |
| `css.mjs` | `structuralCSS()` + `generateHebrewCSS(values)` — the CSS emitter |
| `index.mjs` | `hebrewFirst(text, options)` pipeline + `planFor(text)` |
| `test.mjs` | 56 tests on real Torah text (Genesis 1:1 with taamim) |

## Constraint bundles

- `hf-rtl-default` — RTL everywhere; Latin opts into LTR
- `hf-nikkud-guard` — declared guarantees: `hebrew.nikkud.clear = true`,
  `hebrew.lineHeight.accommodatesNikkud = true`
- `hf-nikkud-type` — nikkud typography rules
- `hf-taamim-type` — taamim typography rules
- `hf-font-stack` — Hebrew/Latin font stacks
- `hf-bidi` — bidi isolation
- `hf-sofit-gershayim` — no-break for acronyms and maqaf words
- `hf-sefer-rtl` — full sefer page (warm paper, 4× Hebrew, English below)
- `hf-latin-mode` — the LTR opt-in

## Markup contract

```html
<p class="hebrew hebrew--taamim" lang="he" dir="rtl">בְּרֵאשִׁית…</p>
<span class="latin">Genesis 1:1</span>          <!-- inline Latin run -->
<span class="he-acronym">ד״ה</span>              <!-- never breaks -->
<bdi>1</bdi>                                   <!-- digits in Hebrew -->
<div class="latin-mode">…English page…</div>   <!-- LTR opt-in -->
```

## Tests

```
node test.mjs   # 56 tests, real Torah text — must be 56/56
```

Tested against Genesis 1:1 (6 taamim, 25 nikkud marks, sofit ץ, sof pasuq ׃)
from the local Tanakh sources, plus gershayim, maqaf, and mixed Hebrew/Latin
edge cases.

## Browser rendering

Automated tests verify analysis, constraint solving, and CSS validity. Pixel
verification of taamim rendering (no clipped marks at 375px–1920px, both
themes) needs a live browser pass and is tracked as follow-up work.
