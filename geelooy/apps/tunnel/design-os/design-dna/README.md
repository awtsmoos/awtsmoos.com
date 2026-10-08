# Design DNA — Traditions as Design Languages

B"H

Every Torah design tradition is a **point in a shared dimensional space**. This
module defines the space, plants five traditions in it (grounded in real printed
exemplars, not stereotypes), and lets you render any design in any tradition —
or blend traditions into new ones.

## The dimensions (`dna.mjs`)

| Dimension | Meaning |
|---|---|
| `typography.scale` | Title-to-body size ratio (4.0 = sefer 4x) |
| `typography.bodySize` | Base body font size, px |
| `typography.lineHeight` | Body line-height as multiple of body font size |
| `spacing.density` | 0..1 — 0 airy/minimal, 1 dense/maximal |
| `color.warmth` | 0..1 — 0 cool/neutral, 1 warm (cream, gold, amber) |
| `color.contrastFloor` | Minimum WCAG contrast ratio for body text |
| `ornament.level` | `none` \| `minimal` \| `moderate` \| `rich` |
| `formality.level` | `formal` \| `balanced` \| `warm` |

## The five traditions (`profiles.mjs`)

| Tradition | Look | Basis |
|---|---|---|
| **chabad** | Clean, clear, warm. Dark ink on cream, 4x titles, Kehot-blue accent | Kehot Tanya & Likkutei Sichos, Chabad.org |
| **litvish** | Dense, serious, black-on-white. Small type, text is king | Vilna Shas page, classic yeshiva seforim |
| **sephardic** | Ornate, warm, dignified. Parchment, gold, deep red | Classic Sephardic title pages & siddurim |
| **chassidic** | Warm, story-like, inviting. Large airy type, amber warmth | Chassidic story collections |
| **modern** | Minimal, digital-first, accessible. 18px body, AAA contrast | Contemporary accessible web typography |

Each profile is a **constraint-DSL bundle** — the same language as the shared
constraint library — so a tradition is a set of *verified mathematical
guarantees*, not a theme name. Profiles avoid every path set by the
Hebrew-first structural bundles, so they compose cleanly.

## API (`index.mjs`)

```js
import { designInStyle, designInBlend, traditionDistances } from "./index.mjs";

// Render in a tradition:
const r = designInStyle("chabad");
r.ok;                       // true
r.values["title.fontSize"]; // "64px"
r.values["paper.background"]; // "#fffdf6"
r.values["ornament.level"];  // "minimal"

// Caller constraints compose (must not re-assign profile paths):
designInStyle("modern", "sidebar.width = 20em");

// Blend two traditions (weightA: 1 = fully A):
const b = designInBlend("chabad", "modern", 0.7);

// How far apart are the traditions?
traditionDistances(); // 10 pairs, sorted by DNA distance
```

Every call runs the **real constraint pipeline** (parse → validate → solve).
Structural Hebrew bundles (`hf-rtl-default`, `hf-nikkud-guard`) are included
automatically: RTL default plus nikkud clarity guarantees.

## Blender (`blender.mjs`)

`blendStyles(nameA, nameB, weightA)` interpolates numeric DNA dimensions,
resolves categorical dimensions by weighted vote, and mixes palettes
channel-wise with the solver's own color math. The generated DSL is verified
by actually solving it.

## Tests

```
node --test tests/run.mjs   # 24 tests
```

## Files

- `dna.mjs` — dimension definitions, validation, distance, description
- `profiles.mjs` — the five tradition profiles
- `blender.mjs` — tradition blending
- `index.mjs` — public API
- `tests/run.mjs` — 24 tests
