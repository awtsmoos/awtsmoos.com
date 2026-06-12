B"H

# First Plan: Intense Module Split, No Code Yet

Goal:

Split the recently improved Tunnel Control files into smaller, clearer modules without changing behavior. This is a planning pass only.

Current files to split, based on recent work:

1. `js/features/apiKeys.js`
2. `js/features/status.js`
3. `js/features/pathCrumbs.js`
4. `js/ui/controlPanels.js`

Guiding rules:

- Rewrite complete files only.
- Add small submodules.
- Keep each new file focused.
- Preserve public exports so current imports do not break.
- Verify every relative import resolves.
- Run syntax checks after implementation.
- Do not split CSS again in this planning phase unless a later plan explicitly targets CSS.

## Module Split Plan

### API Keys

Create folder:

`js/features/apiKeys/`

Proposed files:

- `apiKeys/index.js`
  - Public mount/refresh exports.
  - Orchestrates the feature.

- `apiKeys/keyDisplay.js`
  - `maskKey()`
  - status/pill text helpers.

- `apiKeys/keyFeedback.js`
  - `feedback()`
  - JSON/status output helpers.

- `apiKeys/savedKeyCards.js`
  - `savedListNodes()`
  - `savedKeyCard()`

- `apiKeys/keyActions.js`
  - create key flow.
  - pasted key flow.
  - clear active flow.

Then make existing `js/features/apiKeys.js` a tiny compatibility re-export:

```js
export { mountApiKeys, refreshKeyUi } from "./apiKeys/index.js";
```

### Status

Create folder:

`js/features/status/`

Proposed files:

- `status/index.js`
  - Public exports: `refreshLogin`, `refreshDevice`, `refreshStatus`.

- `status/statusText.js`
  - `safe()`
  - `setText()`
  - `setPill()`

- `status/summaryCards.js`
  - `miniCard()`
  - identity summary node builder.
  - device summary node builder.

- `status/tunnelDiscovery.js`
  - `extractTunnelName()`
  - `applyDiscoveredTunnelName()`

- `status/liveConfig.js`
  - `loadLiveConfig()`

Then make existing `js/features/status.js` a compatibility re-export.

### Path Crumbs

Create folder:

`js/features/pathCrumbs/`

Proposed files:

- `pathCrumbs/index.js`
  - Public exports: `renderRelativeCrumbs`, `renderAbsoluteCrumbs`.

- `pathCrumbs/splitPaths.js`
  - `splitRelative()`
  - `splitAbsolute()`

- `pathCrumbs/crumbDom.js`
  - `separator()`
  - `crumbButton()`
  - `renderCrumbs()`

Then make existing `js/features/pathCrumbs.js` a compatibility re-export.

### Control Panels

Create folder:

`js/ui/controlPanels/`

Proposed files:

- `controlPanels/index.js`
  - Public export: `mountControlPanels()`.

- `controlPanels/panelDetection.js`
  - `textOf()`
  - `isHeroLike()`
  - `isNavLike()`
  - `shouldWrap()`

- `controlPanels/panelStorage.js`
  - `rememberCollapsed()`
  - `readCollapsed()`

- `controlPanels/panelToolbar.js`
  - `iconFor()`
  - `textSpan()`
  - `makeToolbarTitle()`
  - `makeFocusButton()`
  - `makeCollapseButton()`

- `controlPanels/panelShell.js`
  - `makePanelShell()`

- `controlPanels/floatingMap.js`
  - `paneForTab()`
  - `makeFloatingMap()`

- `controlPanels/keyboardShortcuts.js`
  - `addKeyboardShortcuts()`

Then make existing `js/ui/controlPanels.js` a compatibility re-export.

## Verification Plan

After implementation, run:

1. `node --check` for all new modules and compatibility files.
2. Full import resolver across `js/`.
3. DOM raw HTML scan for the split modules.
4. Existing focused dashboard forensic checks.
5. Git diff stat.

## Risk Notes

- Avoid circular imports in `apiKeys` by passing callbacks where needed.
- Keep action functions in the same orchestration layer if splitting creates cycles.
- Use compatibility re-exports so other files do not need broad import edits.
- Preserve behavior first; only reorganize.

No implementation has been done in this plan file.
