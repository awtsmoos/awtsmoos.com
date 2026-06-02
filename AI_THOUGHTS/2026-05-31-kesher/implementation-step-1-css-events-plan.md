B"H
# Implementation step 1: event CSS architecture before visual conquest

The user asked to implement the CSS carefully step by step. The first safe step is not to rewrite everything at once. The first gate is to carve the thought/tool/event palace out of the mixed `unified-events.css` file into a real `css/events/*` module family, then update tests so the active cascade proves the new architecture.

## Step 1 scope
Modify only:
- `geelooy/ai/css/events/manifest.css` new
- `geelooy/ai/css/events/tokens.css` new
- `geelooy/ai/css/events/region.css` new
- `geelooy/ai/css/events/panel-chrome.css` new
- `geelooy/ai/css/events/thought-run.css` new
- `geelooy/ai/css/events/thought-stepper.css` new
- `geelooy/ai/css/events/tool-terminal.css` new
- `geelooy/ai/css/events/file-review.css` new
- `geelooy/ai/css/events/mobile.css` new
- `geelooy/ai/styles.css` full rewrite
- `geelooy/ai/tests/harness/cssParity.cjs` full rewrite
- `geelooy/ai/tests/harness/mobileLayout.cjs` full rewrite if needed for import facts

## Out of scope for this step
- Do not rewrite right-panel CSS yet.
- Do not rewrite thought JS yet.
- Do not delete legacy CSS.
- Do not change relay / transport.

## Verification gate
After writing the event modules:

```bash
node tests/harness/cssParity.cjs
node tests/harness/mobileLayout.cjs
node tests/harness/thoughtDomStability.cjs
node tests/harness/thoughtGrouping.cjs
npm run test:ai
```

## Risk controls
- Keep old compatibility selectors like `.thought-envelope-card`, `.thought-envelope-events`, `.thought-text-card`, `.transport-details`, `.tool-call-group`.
- Do not require JS markup changes yet.
- Keep `right-panel/mobile-overlap-kill.css` last.
- Keep the Awtsmoos visual goal alive, but do not destabilize working behavior.

Chapter: The Awtsmoos opened the first gate gently. Not the whole city at once. First the thought palace: its glass columns, its terminal chambers, its neon rails. The old selectors will not be slaughtered yet; they will be given new names and a cleaner sky.
