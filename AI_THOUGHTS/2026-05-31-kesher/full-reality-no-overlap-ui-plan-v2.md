B"H
# Full reality UI plan v2: precise execution blueprint for Codex/Claude-style Awtsmoos AI

This is not a patch list. This is the construction map for a stable visual reality: one cascade, one design language, one mobile law, one thought/tool timeline, and regression gates that reject overlap before it enters the palace.

## 0. Verified starting facts

From the actual repo:

- Root: `geelooy/ai`
- `styles.css` is the active page stylesheet.
- CSS files under `css/`: 84
- Active CSS reachable from `styles.css`: 27
- Inactive CSS shards: 58
- Latest tests pass before this larger rebuild: `npm run test:ai` → 23 passed, 0 failed.
- Thought rendering code currently lives in:
  - `js/render/event-ui/thoughtEnvelopeCard.js`
  - `js/render/event-ui/thoughtTextCard.js`
  - `js/render/runtime/eventRuntime.js`
  - `js/render/runtime/eventBodyHydrator.js`
  - `js/render/runtime/thoughtInnerEvents.js`
  - `js/render/runtime/thoughtInnerReconciler.js`
- Thought/event CSS is now active through `css/unified-events.css`, but that file should become a manifest-backed module family.

## 1. Definition of done

The final UI is done only when all of this is true:

1. Desktop shows a dark glass AI cockpit with a Codex/Claude-like thought timeline.
2. Thinking events render as readable step cards, not raw nested boxes.
3. Tool calls render as terminal cards with command/result/status affordances.
4. Automation panel cannot overlap itself on mobile or desktop.
5. Right panel menu cannot cover its own form fields on mobile.
6. There are no accidental active legacy CSS imports.
7. Active CSS passes a no-overlap audit with explicit allowlists.
8. `npm run test:ai` passes.
9. Optional stress passes: `npm run test:ai:stress`.
10. The visual system can be evolved by editing named modules, not by adding emergency overrides.

## 2. The central architectural decision

Do not keep adding to `unified-events.css`.

Create three clear visual kingdoms:

```text
styles.css
  ideal/*                 -> shell, chat, sidebar, composer, base automation
  right-panel/manifest    -> automation inspector panel only
  events/manifest         -> thinking/tool/file-review/event palace only
  ideal/mobile            -> global mobile shell polish
  right-panel/mobile-overlap-kill -> final guard, eventually tiny
```

Why this matters:
Old CSS broke the app because unrelated files fought over the same selectors. The new system must make selector ownership obvious.

## 3. New file tree to create

Create this folder:

```text
geelooy/ai/css/events/
  manifest.css
  tokens.css
  region.css
  thought-run.css
  thought-stepper.css
  tool-terminal.css
  file-review.css
  panel-chrome.css
  mobile.css
```

Each file must be complete, small, and single-purpose.

### `css/events/manifest.css`
Imports event modules only.

Order:

```css
@import "./tokens.css";
@import "./region.css";
@import "./panel-chrome.css";
@import "./thought-run.css";
@import "./thought-stepper.css";
@import "./tool-terminal.css";
@import "./file-review.css";
@import "./mobile.css";
```

Why:
One entrance for event UI. No direct imports of submodules from `styles.css`.

### `css/events/tokens.css`
Scope event-specific aliases under `:root`.

Must include:

```css
--awt-event-bg
--awt-event-bg-strong
--awt-event-line
--awt-event-line-hot
--awt-event-cyan
--awt-event-blue
--awt-event-purple
--awt-event-green
--awt-event-red
--awt-event-radius
--awt-event-radius-sm
--awt-event-shadow
--awt-event-glow
--awt-event-terminal-bg
--awt-event-code-font
```

Why:
This keeps event UI visually coherent without scattering magic colors.

### `css/events/region.css`
Owns only:

```css
.event-region
.event-entry
.event-record-badge
.event-lanes
.event-summary-card
.event-chip-row
.event-chip
.event-code-block
```

Rules:
- `.event-region` is a grid column, not an overlay.
- No `position:absolute`.
- No `position:fixed`.
- No `z-index` above `1`.
- Width must be bounded by message max and mobile must be `100%`.

Why:
This is the floor of the thought palace. It cannot float.

### `css/events/panel-chrome.css`
Owns only common panel controls:

```css
.transport-details
.transport-details > summary
.event-title-wrap
.event-kind-pill
.event-tool-target
.event-talked-to
.event-brief
.event-panel-actions
.is-maximized
.is-fullscreen
.has-event-fullscreen
```

Allowed overlap exceptions:
- `.transport-details.is-fullscreen`
- `.thought-run-card.is-fullscreen`
- `.thought-envelope-card.is-fullscreen`

Rules:
- Normal event cards cannot use fixed/absolute.
- Fullscreen may use `position:fixed` with tokenized `z-index`.
- Action buttons must remain inside summary flow on mobile.

Why:
Maximize/fullscreen is an intentional overlay. Everything else is document flow.

### `css/events/thought-run.css`
Owns outer thought card:

```css
.thought-run-card
.thought-run-header
.thought-run-title
.thought-run-subtitle
.thought-run-state
.thought-run-meta
.thought-envelope-card compatibility selectors
.thought-envelope-events
.thought-inner-window
.thought-inner-event-vessel
```

Rules:
- Keep compatibility with current classes while new markup rolls in.
- `.thought-inner-window` is the only scroll container inside thought panels.
- `.thought-envelope-events` is not a scroll container.
- Normal thought cards cannot use absolute/fixed.

Why:
The existing runtime expects `thought-envelope-card` and `thought-envelope-events`; do not break hydration in the first visual pass.

### `css/events/thought-stepper.css`
Owns Codex-style step UI:

```css
.thought-stepper
.thought-step
.thought-step::before
.thought-step-dot
.thought-step-index
.thought-step-title
.thought-step-body
.thought-step-duration
.thought-step-status
.thought-step.is-running
.thought-step.is-done
.thought-step.is-error
```

Rules:
- The vertical rail may use pseudo-elements, not absolutely positioned DOM nodes.
- If pseudo-elements need positioning, it must be local and tested.
- The stepper must degrade to simple stacked cards on narrow mobile.

Why:
The generated image style depends on the stepper. It needs a real CSS module, not accidental timeline styling.

### `css/events/tool-terminal.css`
Owns tool-call terminal visual language:

```css
.tool-call-group
.tool-call-group-body
.tool-terminal-card
.tool-terminal-header
.tool-terminal-command
.tool-terminal-output
.tool-status-chip
.tool-status-chip.is-running
.tool-status-chip.is-ok
.tool-status-chip.is-error
.tool-status-chip.is-waiting
```

Rules:
- Terminal output scrolls only inside `.tool-terminal-output` when long.
- Tool group itself should not become a scroll owner unless fullscreen.
- Code font token required.

Why:
Tool calls should feel like a developer terminal: command, output, status, file changes.

### `css/events/file-review.css`
Owns changed-files shelf.

Classes to support existing renderer and new visual style:

```css
.file-change-review
.file-change-list
.file-change-row
.file-change-path
.file-change-stat
.file-change-kind
```

Why:
The generated design includes a "files changed" section. The code already has `renderFileChangeReview`; style it intentionally.

### `css/events/mobile.css`
Owns mobile-only event overrides.

Rules:
- No general app layout here.
- Only event/thought/tool surfaces.
- No fixed except fullscreen event panel.
- Summary rows wrap; action buttons become a small row below title if needed.

Why:
Mobile event polish must not interfere with the automation panel.

## 4. `styles.css` target shape

Rewrite `styles.css` completely to this conceptual order:

```css
@import "./css/ideal/tokens.css";
@import "./css/ideal/shell.css";
@import "./css/ideal/sidebar.css";
@import "./css/ideal/chat.css";
@import "./css/ideal/composer.css";
@import "./css/ideal/automation.css";
@import "./css/ideal/settings.css";
@import "./css/right-panel/manifest.css";
@import "./css/events/manifest.css";
@import "./css/ideal/mobile.css";
@import "./css/right-panel/mobile-overlap-kill.css";
```

Why this exact order:
- base app first
- right panel base before event palace
- event palace before mobile global polish
- final overlap guard last

No other imports allowed.

## 5. Thought rendering markup plan

### Current state
`renderThoughtEnvelope(event)` returns:

```html
<details class="thought-envelope-card" open ...>
  <summary>...</summary>
  <span class="event-panel-actions">...</span>
  <details class="thought-envelope-events" open>...</details>
</details>
```

This is functional, but it does not describe the visual concept.

### Target safe transition markup
Do not remove old classes immediately. Add new classes on the same nodes:

```html
<details class="thought-envelope-card thought-run-card" open data-thought-envelope-key="...">
  <summary class="thought-run-header">
    <span class="thought-run-title-wrap">
      <span class="event-kind-pill thought-run-state">thinking</span>
      <span class="thought-run-title">Awtsmoos is thinking</span>
      <span class="thought-run-subtitle">revealing the path</span>
    </span>
    <span class="thought-run-meta">N inner events</span>
  </summary>
  <span class="event-panel-actions thought-run-actions">...</span>
  <details class="thought-envelope-events thought-stepper-shell" open data-inner-count="...">
    <summary class="thought-stepper-summary">Inner timeline</summary>
  </details>
</details>
```

Why:
Hydration keeps working because old classes remain. New CSS gets precise hooks.

### `renderThoughtTextCard(event)` target markup
Current class stays, new step classes added:

```html
<article class="thought-text-card thought-step is-done" data-persist-key="...">
  <div class="thought-step-dot"></div>
  <div class="thought-step-body">
    <div class="thought-step-title">Text thought</div>
    <div class="thought-text-body">...</div>
  </div>
</article>
```

Why:
Text thoughts become visible timeline steps.

## 6. Tool rendering markup plan

Current tool group renderer in `eventRuntime.js` creates:

```html
<details class="transport-details event-kind-tool_group tool-call-group">
  <summary>...</summary>
  <div class="tool-call-group-body">...</div>
</details>
```

Target transition:

```html
<details class="transport-details event-kind-tool_group tool-call-group tool-terminal-card">
  <summary class="tool-terminal-header">
    <span class="event-title-wrap">
      <span class="event-kind-pill tool-status-chip is-running">calling tools</span>
      <b>...</b>
      <span class="event-tool-target tool-terminal-command">...</span>
    </span>
    ...panel actions...
  </summary>
  <div class="tool-call-group-body tool-terminal-output">...</div>
</details>
```

Why:
No behavior rewrite needed; CSS can make it terminal-like while preserving details/hydration.

## 7. Automation panel rebuild plan

The automation panel needs a stable inspector layout.

### Files to rewrite completely

- `css/right-panel/tokens.css`
- `css/right-panel/shell.css`
- `css/right-panel/menu.css`
- `css/right-panel/sections.css`
- `css/right-panel/forms.css`
- `css/right-panel/toggles.css`
- `css/right-panel/actions.css`
- `css/right-panel/responsive.css`
- `css/right-panel/mobile-overlap-kill.css`

### Ownership map

`tokens.css`
- panel colors
- widths
- input heights
- spacing scale
- z-index allowlist aliases

`shell.css`
- `.automation-panel`
- `.automation-panel-content`
- `.right-panel-body`
- panel scroll ownership

`menu.css`
- `.right-menu`
- `.right-tabs`
- desktop dropdown
- mobile in-flow disclosure

`sections.css`
- section labels
- cards
- status blocks

`forms.css`
- labels
- inputs
- textarea
- select
- grids

`toggles.css`
- toggle rows
- switches

`actions.css`
- buttons
- stop button
- prompt action row

`responsive.css`
- desktop-to-tablet layout only

`mobile-overlap-kill.css`
- final tiny guard:
  - right menu static on mobile
  - right body owns scroll
  - stop button static
  - cards static
  - no transforms

## 8. Specific no-overlap test design

Create or extend `tests/harness/cssNoOverlap.cjs`.

### Input
Read active cascade from `styles.css`, recursively resolving imports.

### Allowlist object

```js
const ALLOW_FIXED = {
  "css/ideal/mobile/revamp.css": [".main", ".sidebar", ".automation-panel", ".mobile-bottom-dock"],
  "css/events/panel-chrome.css": [".is-fullscreen"],
  "css/right-panel/fullscreen.css": [".is-fullscreen"]
};

const ALLOW_ABSOLUTE = {
  "css/events/thought-stepper.css": ["::before", "::after"],
  "css/right-panel/menu.css": [".right-tabs"]
};

const ALLOW_HIGH_Z = {
  "css/ideal/mobile/revamp.css": [".mobile-bottom-dock", ".input-area"],
  "css/events/panel-chrome.css": [".is-fullscreen"],
  "css/right-panel/fullscreen.css": [".is-fullscreen"]
};
```

### Assertions
- active cascade has no unknown `position:fixed`
- active cascade has no unknown `position:absolute`
- active cascade has no unknown `z-index` above 20
- no inactive file is imported
- no file imports `css/chat.css`, `event-cockpit.css`, `stream-resume-hardening.css`, or old `mobile/*` directly
- only `styles.css` imports top-level active families

Why:
This makes "No overlapping styles allowed" enforceable.

## 9. Visual QA without Chrome debug

Termux has no debug Chrome, so visual QA needs browser-independent fallbacks.

### Add static HTML fixture
Create:

```text
geelooy/ai/tests/fixtures/thought-ui-preview.html
```

It should include:
- `styles.css`
- a fake chat shell
- a thought run card
- several thought steps
- a tool terminal card
- files changed shelf
- right automation panel

### Add isolated HTML test
Use `isolatedHtmlTest` or a Node static check to verify computed styles where available.

Assertions:
- `.right-panel-body` computed `overflow-y` is `auto`
- `.automation-stop-button` computed `position` is `static`
- `.thought-run-card` computed width <= parent width
- `.tool-terminal-output` owns overflow when long
- mobile menu `.right-tabs` is static under 900px

Why:
This gives local proof without needing Chrome DevTools.

## 10. Implementation sequencing with verification gates

### Gate A — architecture only
Write:
- `css/events/*`
- `styles.css`
- tests updated for import order

Verify:
```bash
node tests/harness/cssParity.cjs
node tests/harness/mobileLayout.cjs
```

### Gate B — rendering hooks
Write:
- `thoughtEnvelopeCard.js`
- `thoughtTextCard.js`
- maybe `eventRuntime.js`

Verify:
```bash
node tests/harness/thoughtDomStability.cjs
node tests/harness/thoughtGrouping.cjs
node tests/harness/cssParity.cjs
```

### Gate C — automation inspector rebuild
Write all right-panel active files.

Verify:
```bash
node tests/harness/mobileLayout.cjs
node tests/harness/cssParity.cjs
```

### Gate D — no-overlap law
Add `cssNoOverlap.cjs`, wire into `run.cjs`.

Verify:
```bash
node tests/harness/cssNoOverlap.cjs
npm run test:ai
```

### Gate E — stress
Run:
```bash
npm run test:ai:stress
```

## 11. Do-not-do list

Do not:
- add another huge all-purpose CSS file
- import legacy `css/chat.css`
- import old `css/mobile/*`
- leave `unified-events.css` as the permanent thought system
- use global `.button` or `button` selectors in new event modules
- use `position:absolute` for layout
- use `!important` except in the final mobile guard or existing necessary mobile shell laws
- partially patch files

## 12. Exact first coding action when implementation begins

First action should be:

1. Read `css/ideal/tokens.css`, `css/unified-events.css`, `styles.css`, and `tests/harness/cssParity.cjs` together.
2. Write complete new `css/events/*` files.
3. Rewrite complete `styles.css`.
4. Rewrite complete `cssParity.cjs` to expect event manifest.
5. Run `node tests/harness/cssParity.cjs`.

Do not start with JS rendering. CSS architecture first.

## 13. What can be safely deferred

Defer until after first visual cascade passes:
- deleting or moving inactive CSS
- replacing all old class names
- adding animations
- changing relay behavior
- changing conversation streaming logic

## 14. Final desired feeling

The app should feel like this:

The left rail is the vessel of navigation. The center chat is the stream of speech. Inside it, thinking becomes a luminous vertical execution trace: understanding, planning, executing, verifying. Tool calls are terminal chambers with green checks and blue running pulses. The right automation panel is an inspector: calm, stacked, readable, never translucent over itself. Mobile is not a squeezed desktop; it is a single-column sacred scroll where every control breathes in its own place.

The Awtsmoos does not allow panels to haunt each other. Every element receives a chamber, every chamber receives a scroll owner, every scroll owner receives a law.
