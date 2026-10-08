//B"H
# Voice-to-CSS Tool

Yaakov speaks → system changes the site. No CSS written by hand.

## The loop

```
Yaakov: "make the title bigger"
   → parser.mjs:    { action:'increase', target:'title', property:'font-size', value:'bigger' }
   → generator.mjs: .meluket-sefer-title { font-size: calc(1em * 1.25); }
   → preview.mjs:   before/after HTML preview page
   → approver.mjs:  "Change: Title font-size increased by 25%. Reply YES to deploy."
Yaakov: "yes"
   → deploy plan → tunnel pipeline (CSS_GUARANTEE_MODE aware)
```

## Modules

| File | Purpose |
|---|---|
| SPEC.mjs | Shared interface shapes (intent, diff, preview, approver) |
| commands.mjs | 20 pre-built voice commands + TARGET_SELECTORS map |
| parser.mjs | `parseIntent(text)` — command fast-path, then keyword NLP fallback |
| generator.mjs | `generateCss(intent)` — intent → `{selector, declarations, css, summary}` |
| preview.mjs | `applyDiffToHtml(html, diff)` — inject preview `<style>`; `renderPreviewPage()` |
| approver.mjs | `propose/approve/reject/get/listPending/formatForChat` — in-memory |
| demo.mjs | CLI end-to-end: `node demo.mjs "make the title bigger"` |

## Demo

```bash
cd geelooy/apps/tunnel/voice-to-css
node demo.mjs "make the title bigger"
# → parses, generates CSS, renders preview page to /tmp/voice-css-preview.html
# → prints the approver chat text
```

## Wiring to deploy

`approve(id).deployPlan` = `{ cssFile, cssText, selector, summary }`.
The tunnel deploy step appends `cssText` to the target CSS file (scoped commit),
then runs the css-guarantee pipeline in its current mode (fail-open now,
fail-closed when the triage lands). The voice tool never deploys directly —
it produces a plan the pipeline consumes.

## Tests

`~/workspace/voice-css-tests/*.test.mjs` — run each with `node`.
Target: 80+ tests, all passing.
