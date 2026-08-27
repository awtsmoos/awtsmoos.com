B"H
Boruch Hashem
Blessed is He

# Milestone 5 — Final Execution Plan

The Awtsmoos reveals Malchus only after Chochmah becomes Binah and Gevurah gives it form;
Awtsmoos.com therefore moves this browser from idea to vessel one complete file at a time, never cramped and never torn.

## Final architectural decision

Awtsmoos Browser will become a host-owned browser application shell with one primary page viewport.

The first Milestone 5 pass changes only the visual/application surface and preserves every existing runtime handle. It does not yet delete the Merkava runtime or Chromium controller. Immediately after the shell is verified, a separate coordinator integration pass will make the local embedded renderer authoritative for ordinary navigation.

This ordering avoids mixing a major UX rewrite with a renderer-authority rewrite in the same verification surface.

## Production write order

### 1. `browserChrome.js`

Create a focused host-chrome module.

Exports:

- `createBrowserChrome(documentObject)`.

Returns:

- toolbar,
- tab strip,
- active tab title,
- new-tab button,
- navigation-actions slot,
- omnibox address input,
- trust marker,
- mode badge,
- progress indicator,
- advanced toggle.

Accessibility:

- explicit button labels,
- address aria label,
- buttons use `type=button`,
- trust decoration hidden from accessibility tree.

### 2. `browserViewport.js`

Create the browser manifestation surface.

Returns:

- page host for `EmbeddedBrowserFrame`,
- empty-state card,
- developer-stage container,
- existing WebGL canvas,
- existing text canvas,
- explicit local/developer mode switching API or state hooks.

The local page host is visible by default.

The developer canvas stage is retained but hidden by default.

### 3. `browserAdvancedPanel.js`

Create a host-owned advanced drawer.

Contains:

- session slot,
- Merkava editor,
- Render button,
- Self-host button,
- depth input,
- metrics.

Returns all compatibility handles expected by `index.js` and `runtime.js`.

The drawer is closed by default and toggled only by host chrome.

### 4. Rewrite `surface.js`

`surface.js` becomes a small Tiferes compositor.

It:

- creates root/body/boundary,
- creates chrome,
- creates viewport,
- creates advanced panel,
- appends the three regions,
- wires advanced-toggle visibility,
- returns old and new handles in one object.

No child DOM-building logic remains inline.

### 5. Rewrite `remoteSurface.js`

The network/session surface splits visually without splitting its public return contract.

Primary navigation slot receives:

- back,
- forward,
- reload,
- optional compact go action only if still useful.

Advanced session slot receives:

- alias,
- jar,
- clear jar,
- project label,
- status/session testimony.

Current control names remain compatible with the coordinator.

### 6. Rewrite CSS layer

#### `style.css`

Base only:

- root variables,
- box sizing,
- typography,
- shell sizing,
- root/body/boundary layout,
- general button/input font inheritance.

#### `chrome.css`

Browser chrome only:

- tab strip,
- active tab,
- new tab,
- wordmark,
- nav row,
- nav action buttons,
- omnibox,
- trust marker,
- mode badge,
- menu button,
- progress animation,
- focus-visible,
- responsive chrome,
- reduced motion.

#### `viewport.css`

Viewport only:

- dominant white/neutral page canvas area,
- local iframe sizing,
- empty/loading/error state presentation,
- developer stage hidden/visible modes.

#### `advanced.css`

Advanced panel only:

- slide/fade drawer,
- session/tool sections,
- editor textarea,
- diagnostics metrics,
- compact controls,
- narrow-window behavior.

#### `remote.css`

Remote/session control details only.

### 7. Rewrite `index.js`

Only after the new surface files exist and are read back.

Goals:

- load the additional CSS files,
- keep current runtime/controller creation intact for this shell-only pass,
- default user-visible text away from "living Chromium faces",
- expose local-browser language accurately,
- preserve lifecycle cleanup.

If `index.js` exceeds the file-size law after rewrite, split setup stages into new modules rather than compressing it.

## Test write order

No tests are written until all production shell code above is complete.

Then create/update:

1. `awtsmoosBrowserSurface.test.mjs`
   - browser hierarchy,
   - advanced drawer default closed,
   - compatibility handles,
   - accessible labels.

2. `awtsmoosBrowserRemoteSurface.test.mjs`
   - navigation controls placed in primary slot,
   - session controls placed in advanced slot,
   - old return names preserved.

3. Rewrite `merkavaBrowserContract.test.mjs`
   - remove obsolete 32% editor-grid expectation,
   - assert browser-first shell and preserved developer runtime assets.

## Verification sequence

After production and tests are written:

1. `wc -l` on every touched source/test file.
2. Split any file over 120 lines; never shrink comments or compress logic.
3. `node --check` on every JS/MJS file.
4. Scan touched JS/CSS for leading space indentation where tabs are expected.
5. Scan touched JS for compressed one-line control-flow/function patterns.
6. Run new surface tests.
7. Run updated browser contract.
8. Rerun:
   - embedded containment suite,
   - embedded network suite,
   - native auth policy,
   - proxy/profile suite,
   - wider non-Chromium proxy/security suite.
9. Read every touched file in full.
10. Record PLANNED vs ACTUAL vs DELTA.

## Immediate follow-on street

When this UI shell is green, the next execution street is mandatory:

1. create local embedded page loader,
2. create embedded renderer controller,
3. rewrite `browserNavigationCoordinator.js` to obey the already-existing browser navigation policy:
   - native handoff for provider-sensitive auth,
   - embedded renderer for ordinary navigation,
   - explicit fallback only when embedded execution is unavailable,
4. stop calling backend Chromium first,
5. update mode badge/progress/tab title from real renderer state,
6. verify a normal page end-to-end,
7. verify a Google sign-in URL takes the secure native path.

## Stop boundary

Milestone 5 shell itself is complete only when:

- browser-first UI is implemented,
- developer/session controls are preserved but secondary,
- structural/syntax/tests are green,
- prior security/network/auth regressions remain green,
- touched files are reread and documented.

The overall browser project is not complete at that point because renderer-authority integration remains known work.
