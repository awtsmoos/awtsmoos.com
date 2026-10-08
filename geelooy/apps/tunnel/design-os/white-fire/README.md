# White Fire — Design the Emptiness

B"H

In Torah, the white fire around the letters is as holy as the black fire of the
letters themselves. White Fire measures, classifies, and constrains whitespace:
the void must be **designed**, not accidental; the pauses must have **rhythm**,
like the pauses in Torah reading.

## The idea

Every gap between elements is a **pause** — a musical rest measured in multiples
of a base rhythm unit:

| Rest | Multiple | Use |
|------|----------|-----|
| eighth-rest | 0.5× | between footnotes, tight kinship |
| quarter-rest | 1× | between related paragraphs |
| half-rest | 2× | between sections |
| whole-rest | 4× | title → body, major transitions |
| breve-rest | 8× | between chapters, the great pause |

Not all emptiness is white fire. The **detector** tells intentional breathing room
apart from accidental gaps:

1. **Mystery gap** — space nobody declared (no margin/padding/gap accounts for it)
2. **Declaration mismatch** — declared spacing ≠ rendered gap
3. **Orphan gap** — a chasm after a tiny element
4. **Dead space** — empty viewport at the page end with no declared spacing

## Usage

```js
import { analyze, analyzeSefer } from "./index.mjs";

const a = analyzeSefer({
  viewport: { width: 1000, height: 800 },
  baseUnit: 10,
  elements: [
    { id: "title", role: "title",
      box: { x: 100, y: 40, w: 800, h: 80 },
      margin: { bottom: 40 } },          // whole-rest: a designed pause
    { id: "body", role: "body",
      box: { x: 100, y: 160, w: 800, h: 400 } },
  ],
});

console.log(a.score.total); // 0–100
console.log(a.report);      // markdown audit
```

### Constraints

```js
import { analyze } from "./index.mjs";

const a = analyze(layout, `
whitespace.ratio >= 0.4            // the void must breathe
whitespace.ratio <= 0.65           // but not barren
whitespace.intentionalShare >= 0.8 // almost all space designed
emptiness.intentional = true       // shorthand for the above
rhythm.consistent = true           // gaps share a pulse
pause(title, body) >= half-rest    // the pause between two elements
`);
```

Presets: `WHITEFIRE_PRESETS.sefer` (Yaakov's warm-paper defaults),
`WHITEFIRE_PRESETS.strict`.

## Modules

| File | Purpose |
|------|---------|
| `layout.mjs` | Layout model: validation, normalization, box-union geometry |
| `measure.mjs` | Whitespace ratio, vertical gaps, trailing space, horizontal balance |
| `detector.mjs` | Intentional vs accidental classification (4 rules) |
| `rhythm.mjs` | Rests, rhythm scoring (CV), role-based rest recommendations |
| `constraints.mjs` | White-fire DSL checked against an analysis (reuses the shared parser) |
| `report.mjs` | 0–100 score + markdown audit report |
| `index.mjs` | `analyze()` / `analyzeSefer()` / `demo()` pipeline |

## Tests

33 tests, all hand-computed, no mocks:

```
node --test tests/run.mjs
```

## Score

- Whitespace ratio 30 — ideal 0.40–0.60
- Intentionality 30 — share of designed vs accidental space
- Rhythm 25 — gaps share a pulse
- Rests 15 — gaps already at their recommended rest

Grades: `radiant` (90+) · `breathing` (75+) · `crowded` (55+) · `suffocated` (<55)
