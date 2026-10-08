//B"H

# Reverse Design — emotion as input

Start with a feeling. Work backward to the design that creates it.

```js
import { designForEmotion } from "./index.mjs";

const content = `
body.fontSize = 16px
text.color = #2b2118
text.background = #fffdf6
`;

// "I want the reader to feel awe."
const awe = designForEmotion(content, "awe");
// awe.values["title.fontSize"] === "76.8px" (4.8x at default intensity 0.6)

// Intensity slider: mild ↔ overwhelming
const mildAwe = designForEmotion(content, { name: "awe", intensity: 0.2 });
const wildAwe = designForEmotion(content, { name: "awe", intensity: 1.0 });

// Combining: "warm clarity"
const warmClarity = designForEmotion(content, ["warmth", "clarity"]);
```

## The 20 emotions

| Emotion | Feeling it creates |
|---|---|
| awe | Vast, overwhelming, small-before-great |
| warmth | Embrace-like, warm paper, held |
| clarity | Nothing hidden, razor hierarchy |
| joy | Bright, alive, dancing |
| solemnity | Heavy with meaning, dark and deliberate |
| intimacy | Close, personal, whispered |
| reverence | Awe made quiet, standing before |
| wonder | Grand scale lit by bright gold |
| calm | Still water, nothing demands |
| urgency | Now — tight, bold, forward-leaning |
| trust | Solid ground, keeps its promises |
| mystery | Depths below depths, half-revealed |
| gratitude | Thanksgiving, the table is full |
| longing | Distance and desire, cool and vast |
| devotion | Single-hearted, davening at midnight |
| celebration | Exuberant, simchas Torah |
| contemplation | Quiet study, beis midrash at dawn |
| strength | Grounded, immovable, the rock |
| tenderness | Gentle hands, holding something fragile |
| majesty | Royal — the King in His palace |

## How it works

1. **Emotions are bundles.** Each emotion is an intensity-parameterized
   constraint-DSL bundle (`emotions.mjs`). Nothing is hand-waved: awe's
   "monumental scale" is `title.fontSize = (3 + 3t) * body.fontSize`.
2. **Palettes are honest.** Every palette is verified by the test suite using
   the solver's own WCAG `contrastRatio` — each emotion declares a
   `contrastFloor` and the tests assert it at three intensities.
3. **Combining merges.** `combineSources` (`combine.mjs`) merges bundles in
   priority order: the first `=` on a path wins (later ones are skipped with a
   note — never silently), while inequalities compose naturally (the solver
   keeps the strictest bound). Contradictory emotions (urgency + calm) fail
   honestly with the solver's own error.
4. **Priority order:** per-emotion DSL → `extra` → content → default base
   tokens → emotion library bundles (pure fallbacks).

## API

- `designForEmotion(content, emotions, opts)` → `{ok, values, errors, notes, applied, source}`
  - `emotions`: `"awe"` | `["warmth","clarity"]` | `[{name:"awe", intensity:0.9}]`
  - `opts`: `{intensity: 0.6, extra: "…"}` (extra = designer overrides, highest priority)
- `listEmotions()`, `describeEmotions()`, `getEmotion(name)`, `clampIntensity(t)`
- `emotionSources(name, intensity)` → prioritized source list
- `combineSources([{label, source}])` → `{source, notes}`

## Tests

`node --test tests/reverse-design.test.mjs` — 16 tests, all passing.
