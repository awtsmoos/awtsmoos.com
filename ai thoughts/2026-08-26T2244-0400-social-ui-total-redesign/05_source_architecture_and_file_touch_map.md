# B"H
# Source Architecture and Exact File Touch Map

Boruch Hashem. Blessed is He.

The Awtsmoos recreates every viewport in the present tense; Awtsmoos.com should therefore reveal the next useful deed, not every possible deed at once. Repository and browser evidence now constrain the redesign to a small clean UI coordination layer while concurrent Creator work remains protected.

## Corrected evidence

- `/social-composer/` is served directly from canonical `geelooy/social-composer` by the live root `node index.js` process.
- The supplied `width=430` flow is backed by a concurrent geometry test that uses Chrome device emulation; it really produces a narrow `innerWidth`.
- The responsive coordinator currently enshrines `window.matchMedia` breakpoints and a contract that wide Advanced mode opens every major panel.
- The page stacks mode controls, workflow controls, social tools, format controls, the five-button action bar, and preview affordances.
- Concurrent dirty work is confined to `styles/creator/*`, Creator command-palette JS, and two Creator tests. Those files will not be rewritten.
- Core civilization coordinators, root stylesheet, package contract, and responsive test are clean.

## Files that will be rewritten completely

### `geelooy/social-composer/style.css`
Keep every existing import and add the new clarity layer last, after Creator styles, so local hierarchy rules win without editing concurrent Creator modules.

### `geelooy/social-composer/js/civilization/civilizationEnhancements.js`
No — actual file is `geelooy/social-composer/js/civilizationEnhancements.js`.
Rewrite that complete assembly only to install the new action hierarchy beside existing civilization modules.

### `geelooy/social-composer/js/civilization/mobileHierarchy.js`
Reduce the always-visible social tool strip to one quick Media affordance plus one disclosure menu for Reel, Section, Destination, and Audience. Preserve the existing underlying click targets and panel semantics.

### `geelooy/social-composer/js/civilization/composerModes.js`
Keep Simple/Advanced persistence, but place workflow navigation behind a compact `Sections` disclosure instead of exposing four permanent workflow buttons. Use shared composer-width policy when opening panels.

### `geelooy/social-composer/js/civilization/responsivePanels.js`
Default to one intentional content panel at initialization. Focused widths always keep one major panel open. Wide Advanced mode may retain multiple panels only after the user explicitly opens them; switching to Advanced must never explode all panels open. Preview remains an accessible sheet at narrow widths.

### `geelooy/social-composer/tests/responsivePanelsContract.test.mjs`
Replace the old contract that requires all wide Advanced panels to open with the new one-panel default and shared width-policy contract.

### `geelooy/social-composer/package.json`
Add focused UI-contract tests to the normal test chain so hierarchy regression protection is not optional.

## New small modules

### `js/civilization/composerViewport.js`
One responsibility: measure actual composer layout width, classify focused/preview-sheet geometry, and notify responsive coordinators using `ResizeObserver` plus window resize fallback.

### `js/civilization/actionHierarchy.js`
One responsibility: move `Save Server Draft` and `Clear Saved Draft` into a compact `More` disclosure while preserving the original button nodes, IDs, event listeners, and behavior.

### `styles/clarity/index.css`
Import-only entrypoint loaded last.

### `styles/clarity/tokens.css`
Neutral dark palette, calm teal accent, semantic layers, spacing/radius contracts. No standing red/pink destructive treatment.

### `styles/clarity/shell.css`
Page/header/layout/preview typography and surface hierarchy.

### `styles/clarity/panels.css`
Major-panel and nested-disclosure containment. Remove neon box-within-box visual noise.

### `styles/clarity/controls.css`
Buttons, inputs, action hierarchy, selected/focus/disabled states. Publish is the one dominant action; clear-draft is quiet inside disclosure.

### `styles/clarity/menus.css`
Compact mode/workflow/tools/action disclosures.

### `styles/clarity/responsive.css`
320–1024 behavior, preview sheet, action wrapping, safe-area handling, reduced motion.

### `tests/hierarchyContract.test.mjs`
Static architecture contract proving the always-visible tool count is reduced, destructive/server-draft buttons move into More, workflow navigation is disclosed, and clarity CSS loads after Creator CSS.

## Explicitly protected files

Do not rewrite any `styles/creator/*`, `CreatorCommandPalette*`, `futureV15DirectGeometryBrowser.test.mjs`, or `creatorCommandPaletteHygieneContract.test.mjs` in this pass.

## Verification sequence

1. Whole-file readback of every rewritten/new source file.
2. Line-count gate for every human-authored touched code/CSS module.
3. `node --check` on changed JS.
4. Run responsive and hierarchy contracts.
5. Run normal `npm test` from `geelooy/social-composer`.
6. Run browser smoke if base tests pass.
7. Navigate fresh 320/375/430/768/1024/1440 emulated viewports with cache disabled.
8. Inspect overflow, visible panel count, action count, preview state, keyboard focus, and screenshots.
9. Only then discover adjacent social pages sharing the same clutter-causing visual contract.
