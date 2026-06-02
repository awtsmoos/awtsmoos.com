B"H
# Current CSS conflict report against the portrait goal

## What I actually inspected
I audited the current CSS tree under `geelooy/ai/css` and resolved the active cascade from `geelooy/ai/styles.css`.

Verified facts:

- Total CSS files under `css/`: 84
- Active CSS files reachable from `styles.css`: 27
- Inactive legacy CSS files: 58
- Current active top-level imports: 11
- Current active recursive CSS files: 27

Active cascade includes:

```text
styles.css
css/ideal/tokens.css
css/ideal/shell.css
css/ideal/sidebar.css
css/ideal/chat.css
css/ideal/composer.css
css/ideal/automation.css
css/ideal/settings.css
css/right-panel/manifest.css
css/right-panel/tokens.css
css/right-panel/shell.css
css/right-panel/menu.css
css/right-panel/sections.css
css/right-panel/forms.css
css/right-panel/toggles.css
css/right-panel/actions.css
css/right-panel/fullscreen.css
css/right-panel/responsive.css
css/right-panel/mobile-overlap-kill.css
css/unified-events.css
css/ideal/mobile.css
css/ideal/mobile/measure.css
css/ideal/mobile/scenes.css
css/ideal/mobile/crown.css
css/ideal/mobile/composer.css
css/ideal/mobile/polish.css
css/ideal/mobile/revamp.css
```

## Main conclusion
The current CSS is not yet a clean implementation of the generated portrait goal. It is a working cascade with emergency guards. It passes tests, but it still has structural conflict risk because the same surfaces are styled by too many active files.

The goal image needs a deliberate design system. Current CSS is closer to layered survival: base ideal CSS, right-panel CSS, unified event CSS, mobile revamp, then final overlap kill.

The most important missing piece is not more glow. The missing piece is ownership.

## Major active conflict families

### 1. Automation panel is styled by too many files
The same selectors are controlled by multiple active CSS files:

- `#automation-panel .right-panel-body`
  - `css/ideal/mobile/revamp.css`
  - `css/right-panel/mobile-overlap-kill.css`
  - `css/right-panel/responsive.css`
  - `css/right-panel/shell.css`
  - `css/right-panel/tokens.css`

- `#automation-panel .automation-field`
  - `css/ideal/mobile/revamp.css`
  - `css/right-panel/forms.css`
  - `css/right-panel/mobile-overlap-kill.css`
  - `css/right-panel/tokens.css`

- `#automation-panel .automation-toggle-row`
  - `css/ideal/mobile/revamp.css`
  - `css/right-panel/forms.css`
  - `css/right-panel/mobile-overlap-kill.css`
  - `css/right-panel/tokens.css`

- `#automation-panel .automation-status`
  - `css/ideal/automation.css`
  - `css/right-panel/mobile-overlap-kill.css`
  - `css/right-panel/sections.css`
  - `css/right-panel/tokens.css`

- `#automation-panel .chat-scope-pill`
  - `css/ideal/automation.css`
  - `css/right-panel/mobile-overlap-kill.css`
  - `css/right-panel/sections.css`
  - `css/right-panel/tokens.css`

- `#automation-panel .prompt-action-row`
  - `css/ideal/mobile/revamp.css`
  - `css/right-panel/actions.css`
  - `css/right-panel/mobile-overlap-kill.css`

This is the same family that caused the original visual overlap. The current guard helps, but the architecture still allows future selector collisions.

What is missing:

- A single owner for automation layout.
- A single owner for automation cards.
- A single owner for automation controls.
- A rule that mobile global CSS cannot directly style automation internals except through a declared panel mobile file.

What to change:

- Remove automation-specific rules from `css/ideal/mobile/revamp.css`.
- Move them into `css/right-panel/responsive.css` or a new `css/right-panel/mobile.css`.
- Shrink `css/right-panel/mobile-overlap-kill.css` to a final assertion file only.

### 2. Mobile revamp is too powerful
`css/ideal/mobile/revamp.css` is only 55 lines, but it contains:

- 115 `!important` declarations
- 1 fixed positioning rule
- 2 z-index declarations
- 4 overflow-hidden declarations
- 68 selectors

That means it is not just polish. It is a global override cannon.

It currently touches:

- `.main`
- `.sidebar`
- `.automation-panel`
- `.right-panel-body`
- `.event-region`
- `.thought-envelope-card`
- `.tool-window`
- `.bubble`
- `.audio-offer`
- `#send-button`
- `#message-input`
- automation settings filters
- automation form rows

What is missing:

- Mobile CSS must be split by domain:
  - shell mobile
  - composer mobile
  - chat mobile
  - events mobile
  - right-panel mobile

What to change:

- Rewrite `css/ideal/mobile/revamp.css` as a manifest-like thin layer or split it further.
- Move event-specific selectors into `css/events/mobile.css`.
- Move automation-specific selectors into `css/right-panel/mobile.css`.
- Move composer selectors into `css/ideal/mobile/composer.css`.

### 3. Thought/event UI is active but not fully real yet
`css/unified-events.css` is now live and gives thoughts visual styling, but it is doing too many jobs in one file:

- `.event-region`
- `.transport-details`
- `.thought-envelope-card`
- `.thought-text-card`
- `.thought-inner-window`
- `.event-payload`
- `.event-summary-card`
- `.event-chip-row`
- `.event-code-block`
- fullscreen/maximized panels
- mobile overrides

What conflicts:

- `.transport-details` is also styled by `css/ideal/chat.css` and `css/ideal/mobile/polish.css`.
- `.thought-envelope-card` is also styled by `css/ideal/chat.css`, `css/ideal/mobile/polish.css`, and `css/ideal/mobile/revamp.css`.
- `.file-change-row` and `.file-change-actions` are styled by both `css/ideal/chat.css` and `css/ideal/mobile/polish.css`.

What is missing for the goal:

- No real `thought-run-card` system yet.
- No dedicated `thought-stepper` module yet.
- No terminal-like `tool-terminal-card` module yet.
- No event CSS manifest yet.
- No file-change shelf module dedicated to the generated visual goal.

What to change:

- Replace permanent use of `css/unified-events.css` with `css/events/manifest.css`.
- Split event CSS into:
  - `tokens.css`
  - `region.css`
  - `panel-chrome.css`
  - `thought-run.css`
  - `thought-stepper.css`
  - `tool-terminal.css`
  - `file-review.css`
  - `mobile.css`

### 4. Chat base CSS is compressed and too broad
`css/ideal/chat.css` is only 9 physical lines, but it contains about 80 selectors. It controls:

- transport status
- chat box
- message shells
- message bubbles
- event region
- thought envelope card
- message content
- loading states
- file change rows
- live follow button

What is wrong:

The file is not physically modular even if it is conceptually active. It is hard to audit, hard to safely change, and it overlaps with event CSS.

What is missing:

- A split between chat message layout and event/thought/tool internals.
- Event-related selectors should not live in `ideal/chat.css`.

What to change:

- Rewrite `css/ideal/chat.css` into normal readable multiline CSS.
- Remove `.event-region`, `.thought-envelope-card`, `.transport-details`, `.file-change-row`, and `.file-change-actions` from chat base.
- Let `css/events/*` own all event/thought/tool/file-review styling.

### 5. Shell CSS is compressed and includes overlay risk
`css/ideal/shell.css` has:

- 19 `!important`
- 1 fixed position
- 2 absolute positions
- 6 z-index declarations
- 5 overflow-hidden declarations
- about 84 selectors in 15 physical lines

What is wrong:

This is foundational CSS, but it is hard to reason about because it is compressed. It also has overlap-related powers: fixed, absolute, z-index, overflow hidden.

What is missing:

- Named sections for desktop shell, panel shell, overlay shell.
- Clear z-index token usage.
- Explicit overlay allowlist.

What to change:

- Rewrite `css/ideal/shell.css` into readable sections.
- Replace raw z-index values with tokens.
- Document which selectors are allowed to be fixed or absolute.

### 6. Right-panel menu still uses absolute on desktop
`css/right-panel/menu.css` has:

- 57 `!important`
- 1 absolute positioning rule
- 4 z-index declarations
- 2 overflow-hidden declarations

The absolute rule is probably for desktop dropdown behavior. That can be acceptable, but it must be declared in the no-overlap allowlist.

What is missing:

- A formal rule: desktop dropdown may be absolute; mobile menu must be static and in-flow.
- Tests verifying this exact split.

What to change:

- Keep desktop dropdown only if needed.
- Make the mobile static behavior primary and tested.
- Add no-overlap audit allowlist for `.right-tabs` in `menu.css` only.

### 7. Right-panel form/actions files use too many important declarations
Active right-panel files are heavily defensive:

- `css/right-panel/forms.css`: 65 `!important`
- `css/right-panel/actions.css`: 56 `!important`
- `css/right-panel/toggles.css`: 43 `!important`
- `css/right-panel/sections.css`: 36 `!important`

What this means:

The panel is fighting other files. A stable final style should not require this much force.

What is missing:

- Better selector ownership.
- Less global mobile interference.
- Less old cascade conflict.

What to change:

- After moving automation rules out of `mobile/revamp.css`, rewrite right-panel files with fewer `!important` declarations.
- Keep `!important` only in the final guard and maybe mobile scene overrides.

### 8. Inactive legacy CSS is dangerous if imported again
The inactive set includes many old files that style the same surfaces:

High-risk inactive files:

- `css/chat.css`
- `css/event-cockpit.css`
- `css/stream-resume-hardening.css`
- `css/thought-freeze-polish.css`
- `css/thinking-window.css`
- `css/panel-action-rail.css`
- `css/panel-controls.css`
- `css/panel-polish.css`
- `css/mobile/chat-events.css`
- `css/mobile/drawer-overlay.css`
- `css/mobile/panels.css`
- `css/mobile/shell.css`
- `css/right-panel/clarity.css`
- `css/right-panel/spacing.css`
- `css/right-panel-overlap-kill.css`
- `css/right-panel-menu.css`
- `css/automation-futuristic.css`
- `css/automation-cockpit.css`
- `css/automation-form-polish.css`
- `css/automation-status-compact.css`

These are currently inactive, which is good. But they contain selectors for chat, events, thoughts, panels, mobile, automation, and right-panel controls. If one gets imported, the old overlap can return.

What is missing:

- A legacy boundary test.
- A README saying these files are inactive archive shards.
- A denylist in CSS tests.

What to change:

- Add test: no active import may include the high-risk legacy files.
- Add a report file or README documenting why they are not active.

## Missing pieces compared with the generated goal image

### Missing visual pieces

1. No dedicated thought stepper classes yet:
   - `.thought-stepper`
   - `.thought-step`
   - `.thought-step-dot`
   - `.thought-step-title`
   - `.thought-step-duration`
   - `.thought-step-status`

2. No dedicated terminal classes yet:
   - `.tool-terminal-card`
   - `.tool-terminal-header`
   - `.tool-terminal-command`
   - `.tool-terminal-output`
   - `.tool-status-chip`

3. No dedicated files-changed shelf module yet:
   - `.file-change-review`
   - `.file-change-list`
   - `.file-change-row`
   - `.file-change-path`
   - `.file-change-stat`

4. No dedicated event manifest yet:
   - current file is still `css/unified-events.css`.

5. No single source of truth for neon/glass tokens:
   - colors and shadows are repeated across active files.

6. No CSS fixture rendering the target state:
   - a static preview fixture should exist for thought + tool + automation UI.

### Missing structural pieces

1. No no-overlap CSS audit harness yet.
2. No allowlist for legitimate fixed/absolute styles.
3. No declaration of scroll ownership in tests.
4. No ban on high-risk inactive legacy CSS imports.
5. No modular event CSS tree.
6. No final replacement of emergency guard with real layout ownership.

## Specific conflicts that block the goal

### Conflict A: Event CSS belongs partly to chat and partly to unified-events
Goal requires event UI to look like the center timeline in the image.

Current problem:
`css/ideal/chat.css` and `css/unified-events.css` both style event/thought surfaces.

Fix:
Move event/thought/tool/file-review ownership completely into `css/events/*`.

### Conflict B: Automation panel belongs partly to right-panel and partly to mobile revamp
Goal requires the automation panel to look like a vertical inspector.

Current problem:
`css/ideal/mobile/revamp.css` reaches inside automation panel internals.

Fix:
Move all automation mobile internals into `css/right-panel/mobile.css`.

### Conflict C: The final guard is doing too much
Goal says no overlapping styles allowed.

Current problem:
`css/right-panel/mobile-overlap-kill.css` is a heavy rescue file with 48 `!important` declarations.

Fix:
Use it only as an invariant layer after right-panel CSS is rebuilt. It should be tiny.

### Conflict D: Too many compressed CSS files
Goal requires careful, confident styling.

Current problem:
`css/ideal/chat.css` and `css/ideal/shell.css` are compressed, high-selector files.

Fix:
Rewrite them into readable modules or at least readable sections.

### Conflict E: Many active duplicate selectors
Goal needs stable ownership.

Current problem:
Duplicate active selectors include:

- `.right-panel-body`
- `#automation-panel .right-panel-body`
- `#automation-panel .automation-field`
- `#automation-panel .automation-toggle-row`
- `#automation-panel .automation-status`
- `.chat-box`
- `.message`
- `.input-area`
- `.transport-details`
- `.thought-envelope-card`
- `#send-button`
- `#message-input`

Fix:
Each selector must have one owner file. Other files may only modify under declared media scope or state scope.

## Recommended next coding order

### Step 1: Add audit harness before visual rewrite
Create `tests/harness/cssNoOverlap.cjs`.

It should:

- resolve active CSS imports
- list all active selectors
- reject undeclared `position:fixed`
- reject undeclared `position:absolute`
- reject undeclared `z-index > 20`
- reject inactive legacy imports
- reject direct event selectors inside `ideal/chat.css`
- reject automation internals inside `ideal/mobile/revamp.css`

Why first:
Without the test, the rebuild can accidentally preserve the same conflict pattern.

### Step 2: Create `css/events/*` and migrate `unified-events.css`
Create:

```text
css/events/manifest.css
css/events/tokens.css
css/events/region.css
css/events/panel-chrome.css
css/events/thought-run.css
css/events/thought-stepper.css
css/events/tool-terminal.css
css/events/file-review.css
css/events/mobile.css
```

Then update `styles.css` to import `css/events/manifest.css` instead of `css/unified-events.css`.

### Step 3: Rewrite thought renderer hooks
Update:

- `js/render/event-ui/thoughtEnvelopeCard.js`
- `js/render/event-ui/thoughtTextCard.js`
- possibly `js/render/runtime/eventRuntime.js`

Keep old classes for compatibility. Add new classes for the target design.

### Step 4: Untangle mobile revamp
Rewrite `css/ideal/mobile/revamp.css` so it no longer owns:

- `#automation-panel .right-panel-body`
- `#automation-panel .automation-field`
- `#automation-panel .automation-toggle-row`
- `#automation-panel .prompt-action-row`
- event/thought internals beyond broad width safety

Move those into event/right-panel files.

### Step 5: Rebuild right-panel CSS around ownership
Rewrite right-panel active files so:

- `shell.css` owns layout and scroll
- `menu.css` owns menu only
- `sections.css` owns cards/status only
- `forms.css` owns fields only
- `toggles.css` owns switches only
- `actions.css` owns buttons only
- `responsive.css` owns breakpoints only
- `mobile-overlap-kill.css` becomes minimal final law

### Step 6: Split or rewrite chat/shell compressed CSS
Rewrite:

- `css/ideal/chat.css`
- `css/ideal/shell.css`

Goal:
Readable, auditable, no event internals in chat, no unexplained overlay rules in shell.

### Step 7: Add static target fixture
Create:

`tests/fixtures/thought-ui-preview.html`

It should show:

- left rail
- central thought timeline
- executing terminal card
- file changed shelf
- right automation panel
- mobile width scenario

### Step 8: Verify
Run:

```bash
node tests/harness/cssNoOverlap.cjs
node tests/harness/cssParity.cjs
node tests/harness/mobileLayout.cjs
node tests/harness/thoughtDomStability.cjs
node tests/harness/thoughtGrouping.cjs
npm run test:ai
npm run test:ai:stress
```

## Bottom-line severity list

Critical:

1. Automation internals are still styled by too many active files.
2. Mobile revamp is too broad and too forceful.
3. Event/thought styling is active but not modular enough for the final goal.
4. No no-overlap audit exists yet.

High:

5. `ideal/chat.css` and `ideal/shell.css` are compressed and overbroad.
6. Right-panel files rely on many `!important` rules.
7. Legacy inactive CSS can reintroduce old bugs if imported.

Medium:

8. Thought renderer markup lacks target-specific classes.
9. Tool renderer markup lacks terminal-specific classes.
10. No static fixture exists for visual target verification without Chrome.

## Chapter
The Awtsmoos entered the CSS forest as a blade of silent light. Eighty-four scrolls lifted from the dark like old gates. Twenty-seven were alive, fifty-eight slept with sharp teeth. The living ones were not evil; they were crowded. They reached over each other with `!important` hands, z-index crowns, fixed thrones, absolute hooks. The twist was clear: the monster was not one bad rule. The monster was shared ownership. The cure is not another shield. The cure is law: one chamber, one scroll owner, one selector kingdom, one final guard at the edge of the glass.
