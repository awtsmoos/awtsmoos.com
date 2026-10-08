//B"H

# Design Archive + Teaching System

Every design decision, preserved. Every design, teachable.

A design decision is like a psak: the question asked, the sources consulted,
the conclusion reached, and who signed it. This module is the responsa
literature of the Design OS — and the rebbe who teaches it.

## The Archive

Each `design()` call can be logged: the constraint source (the question),
the solved values (the answer), the timestamp, who approved, and a note.

```js
import { designAndLog, query, summarize, exportMarkdown } from "./index.mjs";

const { result, record } = designAndLog(
  `body.fontSize = 16px\ntitle.fontSize = 4 * body.fontSize`,
  { bundles: ["type-scale-4x"], note: "Sefer title scale", tag: "meluket", approvedBy: "yaakov" }
);

// Later: "show me all title decisions from October"
const hits = query({ contains: "title.fontSize", since: "2026-10-01", okOnly: true });
console.log(summarize());
console.log(exportMarkdown({ tag: "meluket" })); // a sefer of decisions
```

Stored as JSONL at `~/.awtsmoos-design-archive/design-decisions.jsonl`
(override with `setArchivePath()` or the `AWTSMOOS_DESIGN_ARCHIVE` env var).
One record per line — queryable forever, never rewritten, only appended
(approvals update in place via `approve(id, by)`).

## The Explainer

Plain language for every choice — no jargon:

```js
import { explain, whyValue } from "./index.mjs";

const e = explain(`
  body.fontSize = 16px
  title.fontSize = 4 * body.fontSize
  title.color = #2b2118
  title.background = #fffdf6
  contrast(title.color, title.background) >= 7.0
`);
// "The title font size is 64px, because the design declares it as
//  4 × the body font size, where the body font size is 16px."
// "The design requires the contrast between the title color and the
//  title background to be at least 7.0. It achieves 15.47 — comfortably
//  passing by 8.47. This is what keeps text readable instead of washed out."

console.log(whyValue(src, "title.fontSize"));
```

## Teacher mode

The AI as rebbe for design — what was decided, why, which letter stands
behind it (with sources), and how to judge it.

```js
import { teach, answerQuestion, lessonMarkdown, verdict } from "./index.mjs";

const lesson = teach(src);
for (const s of lesson.sections) console.log("## " + s.title, "\n" + s.body);

console.log(answerQuestion(src, "Why is the title so big?"));
console.log(answerQuestion(src, "Why is it beautiful?"));
console.log(verdict(src)); // one-line judgment
console.log(lessonMarkdown(src)); // a full page for the sefer
```

Sections: **What was decided** · **Why each choice was made** ·
**The letters behind it** (א–ת, each with its principle and sources;
failing letters are named honestly — "a rebbe does not flatter") ·
**How to judge it** (the letters' score).

## Tests

```sh
node --test tests/
```
