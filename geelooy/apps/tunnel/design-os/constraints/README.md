# Awtsmoos Design OS — Constraint Language

B"H

A formal language for expressing design intent as mathematical constraints.
Instead of writing CSS that might conflict, designers declare what must be
true — and the solver finds values that satisfy every constraint.

## Quick start

```js
import { design, demo } from "./index.mjs";

const result = design(`
  body.fontSize = 16px
  title.fontSize = 4 * body.fontSize
  sefer.background = #fffdf6
  sefer.color = #2b2118
  contrast(title.color, title.background) >= 7.0
  english.position = below(hebrew)
  hebrew.direction = rtl
`);

if (result.ok) {
  console.log(result.values);
  // {
  //   "body.fontSize": "16px",
  //   "title.fontSize": "64px",
  //   "sefer.background": "#fffdf6",
  //   "sefer.color": "#2b2118",
  //   "english.position": "below(hebrew)",
  //   "hebrew.direction": "rtl"
  // }
} else {
  console.error(result.errors);
}
```

Or run the built-in demo:

```js
import { demo } from "./index.mjs";
console.log(demo().values);
```

## Syntax

```
// Comments start with //

// Assignment (defines a value)
title.fontSize = 4 * body.fontSize

// Comparisons (checks, must hold after solving)
title.fontSize >= body.fontSize
contrast(title.color, title.background) >= 7.0

// Range membership
layout.width in [375, 1920]

// Values:
//   numbers:      42, 4.5, -3
//   dimensions:   16px, 2em, 1.5rem, 50%
//   colors:       #fff, #2b2118
//   strings:      "hello"
//   keywords:     rtl, ltr, bold, center, serif, auto
//   paths:        body.fontSize (references another target)
//   calls:        darken(#fff, 10), contrast(a, b), below(hebrew)
//   ranges:       [375, 1920]

// Arithmetic: + - * / with standard precedence, parentheses
//   title.fontSize = (2 + 2) * body.fontSize
```

## Pipeline

```
source → parse → validate → solve → values
```

1. **Parse** (`parser.mjs`): source text → AST. Syntax errors reported with line/col.
2. **Validate** (`validator.mjs`): checks satisfiability before solving —
   conflicting assignments, impossible bounds, empty ranges, type errors,
   unknown functions, self-references, division by zero.
3. **Solve** (`solver.mjs`): topological resolution of `=` definitions in
   dependency order, then verification of `>=`, `<=`, `in`, and call-subject
   constraints (e.g. `contrast(...) >= 7.0`).

## Built-in functions

| Function | Args | Returns | Description |
|---|---|---|---|
| `contrast(a, b)` | color, color | number | WCAG contrast ratio (1–21) |
| `luminance(c)` | color | number | WCAG relative luminance (0–1) |
| `darken(c, n)` | color, number | color | Darken by n% |
| `lighten(c, n)` | color, number | color | Lighten by n% |
| `mix(a, b, n)` | color, color, number | color | Mix a→b by n% |
| `min(a, b)` / `max(a, b)` | number, number | number | |
| `clamp(v, lo, hi)` | number ×3 | number | |
| `abs(x)` / `round(x)` | number | number | |
| `below(x)` / `above(x)` / `beside(x)` | any | position | Relative placement |

## Constraint library

100 pre-built bundles in `library.mjs`, organized by category:

- **typography** (20): 4x scale, line heights, weights, Hebrew serif, …
- **color** (20): sefer light/dark themes, WCAG AA/AAA, white-on-white guard, …
- **layout** (20): page width, stacked Hebrew/English, spacing, touch targets, …
- **hebrew** (20): RTL, English-under-Hebrew, phrase rules, nikkud spacing, …
- **spacing** (10): spacing scale, section/paragraph gaps, …
- **interactive** (10): hover/active/focus states, transitions, …

```js
import { getBundle, listBundles, designWithLibrary } from "./index.mjs";

const result = designWithLibrary(
  ["sefer-light-theme", "type-scale-4x", "hebrew-rtl"],
  "body.fontSize = 16px"  // extra source
);
```

## Design principles

1. **Declare, don't style.** Say what must be true; let the solver find how.
2. **Conflicts are errors.** Two different values for one target is a
   validation failure, not a cascade to resolve.
3. **Prove before solving.** The validator rejects impossible programs so the
   solver never produces garbage.
4. **Hebrew first.** RTL, nikkud spacing, and the English-under-Hebrew rule
   are first-class constraints, not afterthoughts.

## Files

- `parser.mjs` — tokenizer + recursive-descent parser → AST
- `validator.mjs` — satisfiability checks, type checking
- `solver.mjs` — topological evaluation + constraint verification + color math
- `library.mjs` — 100 pre-built constraint bundles
- `index.mjs` — `design()`, `designWithLibrary()`, `demo()` pipeline
- `tests/constraints.test.mjs` — 71 tests (`node --test tests/`)
