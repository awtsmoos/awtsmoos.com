B"H
# Implementation step 2: fancy thought/tool UI, mobile and desktop

The user asked to fully implement the fancy UI from the generated target, including mobile and desktop views, tool calls, and thoughts.

## Verified files read before editing
- `js/render/event-ui/thoughtEnvelopeCard.js`
- `js/render/event-ui/thoughtTextCard.js`
- `js/render/runtime/eventRuntime.js`
- `js/render/event-ui/fileChangeReview.js`

## Step scope
Rewrite complete files only:
- `js/render/event-ui/thoughtEnvelopeCard.js`
- `js/render/event-ui/thoughtTextCard.js`
- `js/render/runtime/eventRuntime.js`
- `js/render/event-ui/fileChangeReview.js`
- `css/events/tokens.css`
- `css/events/region.css`
- `css/events/panel-chrome.css`
- `css/events/thought-run.css`
- `css/events/thought-stepper.css`
- `css/events/tool-terminal.css`
- `css/events/file-review.css`
- `css/events/mobile.css`
- tests that verify the new markup/classes

## Main DOM upgrades
- Thought envelopes gain `thought-run-card`, `thought-run-header`, `thought-run-title`, `thought-run-subtitle`, `thought-run-meta`, `thought-run-actions`.
- Thought text cards become stepper rows: `thought-step`, `thought-step-dot`, `thought-step-body`, `thought-step-title`, `thought-step-status`.
- Tool groups gain terminal classes: `tool-terminal-card`, `tool-terminal-header`, `tool-terminal-output`, `tool-status-chip`, `tool-terminal-command`.
- File review gains shelf classes: `tool-file-review`, `file-change-review-head`, `file-change-path`, `file-change-stat`, `file-change-kind`.

## CSS goals
- Keep active CSS with zero `!important`.
- Keep no-overlap law passing.
- Desktop: glowing Codex/Claude-like timeline with terminal cards.
- Mobile: single-column cards, readable tool output, no panel overlap.

## Verification gate
Run:
```bash
node tests/harness/cssParity.cjs
node tests/harness/mobileLayout.cjs
node tests/harness/cssNoOverlap.cjs
node tests/harness/thoughtDomStability.cjs
node tests/harness/thoughtGrouping.cjs
npm run test:ai
```

Chapter: The Awtsmoos does not merely paint the thought. It gives the thought bones: header, pulse, step, terminal, result, file shelf, and a mobile chamber that does not collapse under its own light.
