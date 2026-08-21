B"H
Boruch Hashem
Blessed is He

# Milestone 5 — File Map and Risk Review

The Awtsmoos gives Chesed to the browser through possibility and Gevurah through boundary;
Awtsmoos.com joins them in Tiferes so the interface may feel free while host trust remains profoundly sound.

## Exact production files

### New: `browserChrome.js`

Responsibility:

- trusted tab strip,
- trusted navigation action slot,
- omnibox,
- execution-mode badge,
- progress indicator,
- advanced-drawer toggle.

Must not own:

- history,
- networking,
- guest rendering,
- cookie/session state.

### New: `browserViewport.js`

Responsibility:

- create dominant page host,
- create developer-renderer container,
- preserve existing WebGL/text canvas handles,
- expose explicit local/developer viewport states.

Must not own:

- actual navigation,
- embedded frame lifecycle,
- resource loading.

### New: `browserAdvancedPanel.js`

Responsibility:

- collapsible drawer,
- session-control slot,
- Merkava editor/tools,
- diagnostics and metrics.

Must default closed.

### Rewrite: `surface.js`

Responsibility after rewrite:

- compose chrome,
- compose viewport,
- compose advanced panel,
- return compatibility handles expected by current callers.

The file should not recreate subcomponents directly.

### Rewrite: `remoteSurface.js`

Responsibility after rewrite:

- back/forward/reload buttons mount into primary navigation slot,
- alias/jar/clear-jar/project status mount into advanced session slot,
- return existing control names for current coordinator compatibility.

### CSS split

#### Rewrite: `style.css`

Only:

- root layout,
- color/token variables,
- global box sizing,
- typography,
- shell background.

#### New: `chrome.css`

Only:

- tab strip,
- browser navigation row,
- omnibox,
- mode/trust badge,
- loading progress,
- responsive/reduced-motion rules for chrome.

#### New: `viewport.css`

Only:

- page viewport,
- embedded frame sizing,
- loading/error/empty states,
- developer renderer visibility.

#### New: `advanced.css`

Only:

- advanced drawer,
- editor/tools layout,
- diagnostics cards,
- responsive drawer behavior.

#### Rewrite: `remote.css`

Only:

- navigation button visuals,
- session controls inside advanced drawer,
- session/status chips.

## Existing contracts that must survive

`createBrowserSurface()` currently feeds:

- `index.js`,
- `createRemoteNavigationControls()`,
- `createMerkavaRuntimeController()`,
- `bindInputForwarding()`,
- `createBrowserNavigationCoordinator()`.

Therefore the first shell rewrite preserves:

- `root`,
- `body`,
- `boundary`,
- `address`,
- `editor`,
- `renderButton`,
- `selfHostButton`,
- `depth`,
- `glCanvas`,
- `textCanvas`,
- `stage`,
- `metrics`.

New handles are additive.

## Immediate architectural risks

### Risk 1 — Pretty shell around Chromium

Failure mode:

The visual surface improves while ordinary navigation still calls `createInteractiveBrowserController()` first.

Control:

Milestone 5 shell is followed immediately by coordinator rewrite. The UI must show actual execution mode rather than always saying local.

### Risk 2 — Guest content counterfeits browser chrome

Failure mode:

Remote page attempts to visually impersonate omnibox, trust state, or provider handoff.

Control:

Host chrome is outside the sandboxed iframe and has a distinct shell background/elevation. Guest viewport never overlaps trusted chrome.

### Risk 3 — Developer tools disappear

Failure mode:

Merkava/self-host debugging becomes inaccessible during renderer migration.

Control:

Preserve the existing editor, canvases, metrics, render button, self-host button, and depth control inside the advanced drawer.

### Risk 4 — Existing tests enforce obsolete 32% editor layout

Failure mode:

A legacy structural contract blocks the product redesign even though runtime consumers no longer require that visual hierarchy.

Control:

Update `merkavaBrowserContract.test.mjs` to test preserved handles and the new browser hierarchy instead of hard-coding the old editor-first grid.

### Risk 5 — fake multi-tab UX

Failure mode:

UI implies independent multi-tab state before tab/session isolation exists.

Control:

Milestone 5 renders one active tab plus a structural new-tab affordance. True multi-tab state remains a later work node.

### Risk 6 — motion harms usability

Failure mode:

Animations delay input or distract from page content.

Control:

Use transform/opacity only, short durations, no blocking transitions, and `prefers-reduced-motion` overrides.

### Risk 7 — narrow Geelooy windows become unusable

Failure mode:

Tabs and omnibox collapse below practical widths.

Control:

Hide wordmark first, then optional badge text; preserve nav buttons and omnibox. Advanced drawer becomes full-width under narrow breakpoints.

## Verification shadow

After all shell code is written:

1. line-count audit,
2. syntax checks,
3. tab-indentation scan,
4. browser surface DOM unit test,
5. remote surface placement test,
6. update and run `merkavaBrowserContract.test.mjs`,
7. run prior embedded/network/auth/proxy regressions,
8. browser preview inspection once the app can be launched locally.
