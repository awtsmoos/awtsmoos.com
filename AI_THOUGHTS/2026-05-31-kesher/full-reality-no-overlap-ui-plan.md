B"H
# Full reality UI plan: Codex/Claude-style thoughts, commands, automation, zero overlap

## Verified CSS read
I read every CSS file under `geelooy/ai/css` by script, not by guess.

- Total CSS files: 84
- Active CSS files reachable from `styles.css`: 27
- Inactive / legacy CSS files: 58
- Current active top-level cascade:
  1. `css/ideal/tokens.css`
  2. `css/ideal/shell.css`
  3. `css/ideal/sidebar.css`
  4. `css/ideal/chat.css`
  5. `css/ideal/composer.css`
  6. `css/ideal/automation.css`
  7. `css/ideal/settings.css`
  8. `css/right-panel/manifest.css`
  9. `css/unified-events.css`
  10. `css/ideal/mobile.css`
  11. `css/right-panel/mobile-overlap-kill.css`

## Core diagnosis
The desired visual reality cannot be achieved by adding more emergency CSS. The codebase already has many old, inactive style shards with similar selectors. The right move is to make one named design system, one active cascade, one event/thought surface, one automation panel surface, and tests that ban overlap-prone CSS patterns from returning.

The new style should not be a patch. It should become a controlled cascade architecture.

## No-overlap law
Every active visual module must obey these rules:

1. No `position:absolute`, `position:fixed`, or high `z-index` inside normal cards unless it is a declared overlay component.
2. All mobile automation controls flow in document order.
3. Only these may be fixed/overlay:
   - mobile scene drawer containers
   - fullscreen event panel
   - global mobile dock
   - explicit modal/backdrop if later added
4. Every scrollable area must be owned by exactly one parent:
   - `.chat-box` owns chat scroll
   - `.right-panel-body` owns automation scroll
   - `.thought-inner-window` owns inner thought scroll
5. Emergency last-file guards are allowed only as tests, not as permanent design crutches. Long term, `mobile-overlap-kill.css` should shrink after the real modules are clean.

## Target visual system
Inspired by the generated image: dark glass, neon cyan/blue/purple, Codex-style execution trace, Claude-Code-like command blocks.

### Desired user-facing structure
- Left rail / app crown remains stable.
- Main chat contains a `Thoughts` event timeline when thinking/tool events exist.
- Each thought run appears as a vertical stepper:
  - Understanding
  - Planning
  - Executing
  - Verifying
  - Complete
- Tool calls render as terminal cards with status chips:
  - Running
  - Passed
  - Failed
  - Waiting
- Files changed render as a small review shelf.
- Automation panel is a calm right-side inspector, not a floating stack.

## Modification plan

### Phase 1 — Create explicit design tokens
Rewrite `css/ideal/tokens.css` completely.

Add semantic tokens:
- `--awt-bg-0`, `--awt-bg-1`, `--awt-glass`, `--awt-glass-strong`
- `--awt-line`, `--awt-line-hot`, `--awt-line-soft`
- `--awt-cyan`, `--awt-blue`, `--awt-purple`, `--awt-green`, `--awt-red`
- `--awt-radius-sm`, `--awt-radius-md`, `--awt-radius-lg`, `--awt-radius-xl`
- `--awt-shadow-soft`, `--awt-shadow-glow`, `--awt-inset`
- `--awt-z-base`, `--awt-z-dock`, `--awt-z-fullscreen`
- `--awt-chat-max`, `--awt-panel-width`, `--awt-mobile-top`, `--awt-mobile-bottom-lift`

Why:
All active files currently repeat colors, radii, shadows, and z-index ideas. Central tokens reduce selector fights and prevent overlapping style drift.

### Phase 2 — Split unified event styling into smaller live modules
Replace `css/unified-events.css` with a manifest and split into:

- `css/events/manifest.css`
- `css/events/tokens.css`
- `css/events/region.css`
- `css/events/thought-stepper.css`
- `css/events/tool-cards.css`
- `css/events/file-review.css`
- `css/events/panel-chrome.css`
- `css/events/mobile.css`

Then change `styles.css` to import `css/events/manifest.css` instead of `css/unified-events.css`.

Why:
`unified-events.css` is now doing too many jobs in one file. A Codex/Claude-style timeline needs clean internal roles, not one mixed file that future edits will fight.

### Phase 3 — Upgrade thought rendering markup
Rewrite these files completely:

- `js/render/event-ui/thoughtEnvelopeCard.js`
- `js/render/event-ui/thoughtTextCard.js`
- `js/render/runtime/eventRuntime.js` only if needed for tool group wrapper classes

New markup classes:
- `.thought-run-card`
- `.thought-run-header`
- `.thought-run-state`
- `.thought-stepper`
- `.thought-step`
- `.thought-step-dot`
- `.thought-step-body`
- `.thought-terminal-card`
- `.thought-command-line`
- `.thought-result-line`

Why:
The existing markup is good but generic: `thought-envelope-card`, `thought-envelope-events`, `thought-text-card`. To achieve the image style, the DOM needs stepper-specific hooks. CSS alone can fake it, but it will become brittle.

### Phase 4 — Normalize tool call visuals
Rewrite or split tool-related CSS and keep renderer class names stable.

Target classes:
- `.tool-call-group`
- `.tool-call-group-body`
- `.tool-terminal`
- `.tool-status-chip`
- `.tool-file-review`

Modify renderer only if current events do not expose enough data for status / command / result.

Why:
Tool calls currently render as grouped `details`. The desired look needs a terminal-card surface but should preserve collapsible details for accessibility.

### Phase 5 — Make automation panel real, not patched
Rewrite active right-panel files completely:

- `css/right-panel/tokens.css`
- `css/right-panel/shell.css`
- `css/right-panel/menu.css`
- `css/right-panel/sections.css`
- `css/right-panel/forms.css`
- `css/right-panel/toggles.css`
- `css/right-panel/actions.css`
- `css/right-panel/responsive.css`
- `css/right-panel/mobile-overlap-kill.css`

Goal:
`mobile-overlap-kill.css` becomes tiny and only asserts final mobile laws, not dozens of rescue rules.

Why:
Current active right panel still depends on defensive overrides. The final UI should have no overlapping styles by construction.

### Phase 6 — Collapse legacy CSS into an explicit archive boundary
Do not delete legacy CSS yet. Instead add `css/LEGACY_README.md` or `AI_THOUGHTS/.../css-legacy-map.md` listing inactive files and stating they must not be imported directly.

High-risk inactive shards found:
- `css/right-panel/spacing.css`
- `css/right-panel/clarity.css`
- `css/mobile/panels.css`
- `css/mobile/drawer-overlay.css`
- `css/chat.css`
- `css/event-cockpit.css`
- `css/stream-resume-hardening.css`
- `css/automation-futuristic.css`
- `css/panel-action-rail.css`
- `css/panel-polish.css`

Why:
These contain many selectors similar to the live UI and many high-risk positioning rules. They are inactive now, but a future import could resurrect overlap bugs.

### Phase 7 — Add regression tests that ban overlap
Extend `tests/harness/cssParity.cjs` and `tests/harness/mobileLayout.cjs`.

New test facts:
- `eventsManifestLive: true`
- `thoughtStepperLive: true`
- `toolTerminalLive: true`
- `automationPanelSingleScrollOwner: true`
- `noLegacyCssImported: true`
- `noUndeclaredActiveAbsolute: true`

Specific assertions:
- `styles.css` must import only manifests or ideal modules in declared order.
- `css/events/manifest.css` must import event modules in declared order.
- no active CSS file may contain `position:absolute` unless it matches allowlist.
- no active CSS file may contain `position:fixed` unless allowlisted.
- no active CSS file may use z-index above 10 unless allowlisted.
- `.right-panel-body` must be the only scroll owner in automation panel mobile.
- `.thought-inner-window` must be the only scroll owner inside thoughts.

Why:
This is the only way to guarantee "no overlapping styles allowed" as a permanent law.

### Phase 8 — Visual implementation order
Do the files in this order:

1. `css/ideal/tokens.css`
2. `css/events/*` new modules
3. `styles.css`
4. `js/render/event-ui/thoughtEnvelopeCard.js`
5. `js/render/event-ui/thoughtTextCard.js`
6. `js/render/runtime/eventRuntime.js` if terminal wrappers need better classes
7. `css/right-panel/*` active modules
8. `tests/harness/cssParity.cjs`
9. `tests/harness/mobileLayout.cjs`
10. run targeted tests
11. run `npm run test:ai`
12. run stress if needed

## Exact active files to avoid touching first
Do not start with these unless a test demands it:
- inactive legacy CSS files
- extension server files
- relay files
- conversation controller files

Why:
The current issue is visual cascade architecture, not relay or transport.

## Expected final result
- Thoughts look like a luminous execution timeline.
- Tool calls look like terminal cards with clear running/pass/fail status.
- Automation panel looks like a stable inspector with no stacked translucent layers.
- Mobile layout has exactly one scroll owner per surface.
- The test suite prevents any new overlap-prone CSS from entering active cascade.

## Verification commands
Run after each phase:

```bash
node tests/harness/cssParity.cjs
node tests/harness/mobileLayout.cjs
```

Run at the end:

```bash
npm run test:ai
```

Optional stress:

```bash
npm run test:ai:stress
```

Chapter: The Awtsmoos does not decorate the shattered vessel. It names every chamber, gives every scroll one gate, forbids the ghosts of old CSS from entering, and then the thought-palace can shine without one panel eating another.
