B"H

# Rushed Full Implementation Plan: Concrete Beauty + Architecture Completion

The request is to make an intense, concrete plan for editing all files needed to rush implementation of the entire concrete brainstorm plan:

1. Universal Command Palette
2. Floating Workspace Dock
3. Real Activity Center
4. Favorites Everywhere
5. Workspace Restore
6. Explorer Split View
7. Workspace Breadcrumb History
8. Dashboard Cards
9. Animated Health System
10. Search Everything
11. Quick Open
12. Command History Explorer
13. Timeline View
14. Split Every File Under 80 Lines
15. Feature Folders Everywhere
16. UI Registry

Important current state:

- A first beauty layer already exists at `js/beauty/`.
- It has many surfaces, but it is still mostly a layer above the existing app.
- The next implementation must deepen it into real architecture:
  - registry-backed actions
  - registry-backed search
  - explorer-backed split preview/history/favorites
  - persisted command history
  - real dock and dashboard cards

This plan is the rushed but sane path.

---

# Phase 0: Inspection Before Edits

Read these files fully before code changes:

## App boot and global state

- `js/boot/init.js`
- `js/boot/bootAccessors.js`
- `js/platform/eventBus.js`
- `js/platform/workspaceMemory.js`
- `js/platform/activityStream.js`
- `js/state/state.js`

## Routing / shell

- `js/router/paneRouter.js`
- `js/router/bindNavigation.js`
- `js/router/paneMeta.js`
- `js/shell/pageSpecs.js`
- `js/shell/mountShell.js`

## Beauty layer already created

- `js/beauty/index.js`
- `js/beauty/actions.js`
- `js/beauty/commandPalette.js`
- `js/beauty/favorites.js`
- `js/beauty/workspaceMemory.js`
- `js/beauty/eventStream.js`
- `js/beauty/timeline.js`
- `js/beauty/previewDock.js`
- `js/beauty/healthRibbon.js`
- `css/future/views/beauty.css`

## Explorer / file surface

Search and then read likely files:

- `js/features/explorer*.js`
- `js/features/pathCrumbs/*`
- `js/api/tunnel.js`
- all files referencing:
  - `explorerPath`
  - `explorerPreview`
  - `explorerList`
  - `treeBtn`
  - `readBtn`

## Dashboard renderer

- `js/dashboard/dashboard.js`
- `js/dashboard/dashboardSections.js`
- `js/dashboard/dashboardPager.js`
- `css/future/views/dashboard.css`

---

# Phase 1: UI Registry Foundation

Create folder:

`js/platform/registry/`

Files:

## `js/platform/registry/storage.js`

Purpose:

- Small JSON localStorage helpers.
- Prefix all keys with `awt.registry.`.

Exports:

- `readRegistryStore(key, fallback)`
- `writeRegistryStore(key, value)`
- `appendRegistryStore(key, entry, limit = 100)`

## `js/platform/registry/actionRegistry.js`

Purpose:

One canonical place for actions.

Exports:

- `registerAction(action)`
- `registerActions(actions)`
- `getActions()`
- `findActions(query)`
- `runAction(id)`
- `recordActionRun(action, result)`
- `getActionHistory()`

Action shape:

```js
{
  id,
  label,
  group,
  hint,
  keywords,
  pinned,
  run
}
```

Must persist command history.

## `js/platform/registry/panelRegistry.js`

Purpose:

Central registry of panes from `PAGE_SPECS` plus runtime discovered pane nodes.

Exports:

- `registerPanel(panel)`
- `hydratePanelsFromPageSpecs()`
- `getPanels()`
- `findPanels(query)`
- `openPanel(key)`

## `js/platform/registry/shortcutRegistry.js`

Purpose:

Avoid duplicate global shortcut listeners.

Exports:

- `registerShortcut({ id, combo, label, run })`
- `mountShortcuts()`
- `describeShortcuts()`

## `js/platform/registry/searchRegistry.js`

Purpose:

Unify all searchable providers.

Exports:

- `registerSearchProvider(provider)`
- `searchEverything(query)`

Provider shape:

```js
{
  id,
  label,
  search(query) => Promise<Array<Result>> | Array<Result>
}
```

Result shape:

```js
{
  id,
  type,
  title,
  subtitle,
  run
}
```

## `js/platform/registry/index.js`

Purpose:

Hydrate default registry:

- panels from `PAGE_SPECS`
- actions for all panes
- actions for home / refresh / mission / restore
- search providers for actions and panes
- shortcuts for Ctrl+K and Ctrl+P

Exports:

- `mountUiRegistry()`

Files to modify:

- `js/boot/init.js` — call `mountUiRegistry()` before `mountBeautyLayer()`.
- `js/beauty/actions.js` — stop creating ad-hoc actions; read from registry.
- `js/beauty/commandPalette.js` — use `findActions()` and `runAction()`.
- `js/beauty/quickActions.js` — use registered pinned actions.

---

# Phase 2: Universal Command Palette Upgrade

Modify / split:

- `js/beauty/commandPalette.js`

Possibly create:

- `js/beauty/commandPalette/render.js`
- `js/beauty/commandPalette/keyboard.js`
- `js/beauty/commandPalette/state.js`

Goal:

- Ctrl/Cmd+K opens palette.
- Fuzzy search through registered actions.
- Arrow up/down selection.
- Enter runs selected action.
- Esc closes.
- Shows recent command history from `actionRegistry`.
- Shows pinned actions when query empty.

CSS additions:

- `css/future/views/beauty.css`

Selectors:

- `.awt-beauty-palette.is-open`
- `.awt-command-item.active`
- `.awt-command-recents`
- `.awt-command-kbd`

---

# Phase 3: Quick Open / Search Everything

Create folder:

`js/search/`

Files:

## `js/search/providers/actions.js`

Uses action registry.

## `js/search/providers/panes.js`

Uses panel registry.

## `js/search/providers/docs.js`

Indexes `PAGE_SPECS` docs links and prompt/help surfaces.

## `js/search/providers/explorer.js`

Initial version:

- Search recent explorer paths and favorites.
- Later can call tunnel tree/search.

## `js/search/index.js`

Registers providers with search registry.

Modify:

- `js/boot/init.js` — call `mountSearchProviders()`.
- `js/beauty/spotlight.js` — use `searchEverything(query)`.
- Add `Ctrl/Cmd+P` Quick Open using the same search registry.

Create:

- `js/beauty/quickOpen.js`

CSS:

- `.awt-quick-open`
- `.awt-search-result`
- `.awt-search-type-chip`

---

# Phase 4: Floating Workspace Dock

Create:

- `js/beauty/workspaceDock.js`

Behavior:

- Bottom centered dock.
- Built from panel registry.
- Shows 8 core panes:
  - Explorer
  - Terminal
  - Chrome
  - API Keys
  - Runtime Mesh
  - Usage
  - Docs
  - Account
- Active pane gets active state.
- Hover scale glow via CSS.

Modify:

- `js/beauty/index.js` — mount `mountWorkspaceDock()`.
- `css/future/views/beauty.css` — dock styles.

Selectors:

- `.awt-workspace-dock`
- `.awt-dock-item`
- `.awt-dock-item.active`

---

# Phase 5: Real Activity Center + Command History Explorer

Create / modify:

- `js/beauty/activityCenter.js`
- `js/beauty/commandHistory.js`
- `js/beauty/events.js`

Activity center should merge:

- beauty events
- action run history
- pane-open events
- command history

UI:

- filter chips:
  - All
  - Actions
  - Panes
  - Errors
  - Files
- cards with timestamp, label, type, status.

Modify:

- `js/beauty/eventStream.js` may become smaller wrapper around `activityCenter.js`.
- `js/beauty/timeline.js` reads the same persistent source.

CSS:

- `.awt-activity-center`
- `.awt-activity-filter`
- `.awt-command-history-card`

---

# Phase 6: Favorites Everywhere

Create folder:

`js/favorites/`

Files:

## `js/favorites/store.js`

Exports:

- `getFavorites(type)`
- `toggleFavorite(type, id, payload)`
- `isFavorite(type, id)`
- `allFavorites()`

Supported favorite types:

- `pane`
- `command`
- `path`
- `file`

## `js/favorites/actions.js`

Registers action-favorite commands.

Modify:

- `js/beauty/favorites.js` — use central favorite store.
- `js/beauty/commandPalette.js` — show star / pin action.
- Explorer files — add star controls beside path/location where real DOM exists.

CSS:

- `.awt-star-button`
- `.awt-favorite-grid`

---

# Phase 7: Workspace Restore Full

Create folder:

`js/workspace/`

Files:

## `js/workspace/workspaceStore.js`

Persist:

- active pane
- explorer path
- mission mode
- spotlight query
- last preview path
- selected runtime id
- timestamp

## `js/workspace/restoreWorkspace.js`

Exports:

- `captureWorkspace()`
- `restoreWorkspace()`
- `mountWorkspaceRestore()`

Modify:

- `js/router/paneRouter.js` — record active pane through workspace store.
- Explorer module — record explorer path and preview path.
- `js/beauty/missionMode.js` — store mission mode through workspace store too.
- `js/boot/init.js` — after mount, schedule optional restore.

Rushed behavior:

- Auto-restore last pane after boot.
- Restore explorer input path if field exists.
- Restore mission mode body class.

---

# Phase 8: Explorer Split View + Preview Dock + Breadcrumb History

First inspect and split real explorer feature.

Expected files to create:

`js/features/explorer/`

- `index.js`
- `state.js`
- `domRefs.js`
- `pathHistory.js`
- `favorites.js`
- `splitView.js`
- `preview.js`
- `actions.js`
- `renderList.js`

Existing `js/features/explorer.js` becomes re-export wrapper.

Features:

## Split View

- Left: tree/list/results.
- Right: preview.
- CSS grid layout.
- Resizable can be rushed as fixed `minmax(260px, .9fr) minmax(320px, 1.1fr)`.

## Preview Dock

- Beauty preview dock mirrors actual explorer preview.
- Explorer pane itself gets right preview panel.

## Breadcrumb History

Create:

- `js/features/explorer/pathHistory.js`

Exports:

- `rememberExplorerPath(path)`
- `getExplorerHistory()`
- `mountExplorerHistory(container, onPick)`

Modify path change flows to record path.

CSS:

- `css/future/views/explorer.css` or add to `workspace.css` if no explorer module exists.

Prefer new file:

- `css/future/views/explorer.css`

Import from `css/future/index.css`.

---

# Phase 9: Dashboard Cards + Animated Health

Modify:

- `js/dashboard/dashboard.js`
- `js/dashboard/dashboardSections.js`
- `css/future/views/dashboard.css`

Or safer:

Create:

- `js/dashboard/healthCards.js`

Dashboard renders:

- Tunnel
- Filesystem
- Browser
- API Key
- Runtime
- Session

Each card has:

- status label
- subtitle
- pulse class

CSS:

- `.awt-health-card-grid`
- `.awt-health-card.is-good`
- `.awt-health-card.is-warn`
- `.awt-health-card.is-bad`
- keyframe pulse.

If dashboard renderer is risky, mount cards from beauty layer into dashboard after render:

- `js/beauty/dashboardCards.js`

This is faster and lower risk.

---

# Phase 10: Timeline View

Current timeline exists in beauty layer but must be elevated.

Create:

- `js/timeline/timelineStore.js`
- `js/timeline/timelineView.js`

Modify:

- `js/beauty/timeline.js` to use timeline store.
- `js/platform/registry/actionRegistry.js` to append action events.
- `js/router/paneRouter.js` to append pane events.

---

# Phase 11: Split Every File Under 80 Lines

This is the most dangerous if rushed blindly. Do it in waves.

## Wave 11A: new code only

Already required:

- all new files under 80 lines unless CSS.

## Wave 11B: touched files

Keep under 120 as temporary maximum:

- `js/boot/init.js` already split.
- `js/beauty/index.js` should stay under 80 if possible.
- `css/future/views/beauty.css` should be split if grows.

## Wave 11C: existing app files later

Only after tests:

- explorer
- dashboard
- shell
- runtime

---

# Phase 12: Feature Folders Everywhere

Immediate target folders:

- `js/features/explorer/`
- `js/search/`
- `js/favorites/`
- `js/workspace/`
- `js/timeline/`
- `js/platform/registry/`
- `js/beauty/commandPalette/` if palette grows
- `js/beauty/quickOpen/` if quick open grows

Compatibility wrappers:

- keep old imports alive.

---

# Actual File Edit List For Rushed Implementation

## New files

### Registry

- `js/platform/registry/storage.js`
- `js/platform/registry/actionRegistry.js`
- `js/platform/registry/panelRegistry.js`
- `js/platform/registry/shortcutRegistry.js`
- `js/platform/registry/searchRegistry.js`
- `js/platform/registry/index.js`

### Search

- `js/search/providers/actions.js`
- `js/search/providers/panes.js`
- `js/search/providers/docs.js`
- `js/search/providers/explorer.js`
- `js/search/index.js`

### Favorites

- `js/favorites/store.js`
- `js/favorites/actions.js`

### Workspace

- `js/workspace/workspaceStore.js`
- `js/workspace/restoreWorkspace.js`

### Timeline

- `js/timeline/timelineStore.js`
- `js/timeline/timelineView.js`

### Beauty additions

- `js/beauty/workspaceDock.js`
- `js/beauty/quickOpen.js`
- `js/beauty/activityCenter.js`
- `js/beauty/commandHistory.js`
- `js/beauty/dashboardCards.js`

### Explorer split

Exact files depend on real explorer file inspection, but likely:

- `js/features/explorer/index.js`
- `js/features/explorer/state.js`
- `js/features/explorer/domRefs.js`
- `js/features/explorer/pathHistory.js`
- `js/features/explorer/splitView.js`
- `js/features/explorer/preview.js`
- `js/features/explorer/actions.js`

### CSS

- `css/future/views/explorer.css`

## Existing files to rewrite completely

- `js/boot/init.js`
- `js/router/paneRouter.js`
- `js/beauty/index.js`
- `js/beauty/actions.js`
- `js/beauty/commandPalette.js`
- `js/beauty/spotlight.js`
- `js/beauty/favorites.js`
- `js/beauty/timeline.js`
- `js/beauty/eventStream.js`
- `js/beauty/previewDock.js`
- `js/beauty/missionMode.js`
- `css/future/views/beauty.css`
- `css/future/index.css`
- explorer entry file after inspection

---

# Rushed Implementation Order

If implementing immediately, do this exact order:

1. Registry foundation.
2. Wire registry into boot.
3. Replace beauty action lookup with registry.
4. Upgrade command palette with keyboard selection + history.
5. Add quick open backed by search registry.
6. Add workspace dock.
7. Add central favorites store and rewire beauty favorites.
8. Add workspace restore store and wire pane router.
9. Add timeline store and wire pane/action events.
10. Add activity center and command history surfaces.
11. Trace explorer files.
12. Split explorer.
13. Add explorer path history.
14. Add explorer split view.
15. Add dashboard cards mounted by beauty layer.
16. CSS pass for all new surfaces.
17. Verification pass.
18. After-action audit.

---

# Verification Required Before Claiming Done

Run:

```bash
node --check <all new and touched JS files>
```

Run full import resolver:

```bash
node scripts/import-resolver-audit.js
```

or inline resolver.

Run CSS brace audit:

```bash
node scripts/css-brace-audit.js
```

or inline checker.

Run raw HTML scan:

```bash
grep -RIn --include='*.js' -E 'innerHTML|outerHTML|insertAdjacentHTML|document.write|eval\(|new Function\(' js/platform/registry js/search js/favorites js/workspace js/timeline js/beauty js/features/explorer js/boot js/router
```

Run line count guard:

```bash
wc -l <all touched/new files>
```

No live screenshot can be claimed unless Chrome tunnel becomes available.

---

# Risks

1. Explorer code may be more intertwined than expected.
2. Duplicate command palette listeners could conflict unless old platform palette remains unmounted.
3. Auto-restore can annoy users if it opens stale pane too early.
4. Search Everything can be shallow if no actual file indexing is available.
5. File split under 80 lines can create circular imports if rushed.
6. CSS fixed beauty sidebar can obscure content at smaller widths; mobile rules must hide or inline it.
7. Persisted timeline can grow too large; always cap.
8. Favorites need type/id/payload to avoid collisions.

---

# Rushed But Honest Definition Of Done

This pass is done when:

- registry exists and powers actions/search/panels/shortcuts.
- command palette uses registry and has history/keyboard controls.
- quick open exists.
- dock exists.
- activity center exists.
- favorites use a real central store.
- workspace restore uses a real central store.
- timeline/history use persistent stores.
- explorer has split-view and path history.
- dashboard has health cards.
- all imports resolve.
- syntax passes.
- CSS braces pass.
- raw HTML scan on touched code is clean.
- all new JS files stay under 80 lines when possible, under 120 only with justification.
