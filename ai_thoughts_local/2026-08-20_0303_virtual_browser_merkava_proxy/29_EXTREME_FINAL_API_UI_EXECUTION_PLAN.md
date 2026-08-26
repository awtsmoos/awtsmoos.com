B"H
Boruch Hashem
Blessed is He

# Milestone 5B — Final Extreme API/UI Execution Plan

The Awtsmoos is not revealed by ornament without structure. The browser will therefore become more beautiful by becoming more truthful: less duplicated code, more declarative data, stronger boundaries, smaller modules, richer contracts, and styles that never leak beyond their vessel.

## Final implementation order

### Street A — Host DOM substrate

1. Create `ui/hostDomSpec.js`.
2. Create `ui/hostDomRender.js`.
3. Create `ui/hostDomActions.js` only if component action binding genuinely needs it in this pass.
4. Create `ui/browserElementGrammar.js` only for fragments that are reused by at least two components.
5. Test the substrate before migrating components.

Stop condition:
- no `innerHTML`,
- no string event handlers,
- duplicate refs rejected,
- malformed specs rejected,
- children recursive,
- properties/attributes/dataset explicit.

### Street B — Component migration

Migrate one file at a time, full-file rewrites only:

1. `browserChrome.js`
2. `browserViewport.js`
3. `browserDeveloperTools.js`
4. `browserAdvancedPanel.js`
5. `remoteSurface.js`
6. `surface.js`

Each migration must:
- use declarative specs for static structure,
- contain only tiny imperative state transitions,
- have rich JSDocs for every meaningful function,
- use Torah/Kabbalah-inspired names with descriptive suffixes,
- expose grouped APIs,
- retain temporary legacy aliases only where current consumers require them.

### Street C — CSS localization

Create `styles/` and rewrite `style.css` as import-only.

Files:
- `styles/tokens.css`
- `styles/shell.css`
- `styles/chrome.css`
- `styles/viewport.css`
- `styles/advanced.css`
- `styles/remote.css`
- `styles/motion.css`
- `styles/responsive.css`

Delete no existing stylesheet until the replacement imports are proven.

`remote.css` at the program root becomes an import shim only if `index.js` still loads it separately during compatibility; otherwise `index.js` will stop loading it and `style.css` imports the scoped remote module.

### Street D — Browser surface API

Refactor `surface.js` to return grouped contracts:

```js
{
	keterChrome,
	malchusViewport,
	binahAdvanced,
	yesodSession,
	legacy
}
```

During migration, spread/alias current fields so `runtime.js` and the existing coordinator do not break.

New code must consume grouped contracts wherever touched.

### Street E — Entry-point cleanup

Rewrite `index.js` after the surface API is stable.

Goals:
- load only the import-manifest stylesheet,
- remove obsolete separate remote-style loading,
- use grouped surface names internally,
- move startup text away from Chromium language,
- switch developer canvas mode only when Render/self-host tools are used,
- preserve lifecycle cleanup.

If index exceeds 120 lines, split:
- `browserAppLifecycle.js`,
- `browserDeveloperLifecycle.js`,
- `browserNavigationLifecycle.js`.

### Street F — Coordinator authority

Only after shell/API tests are green:

1. Create embedded page-loader modules.
2. Create local embedded renderer controller.
3. Rewrite `browserNavigationCoordinator.js` to obey `browserNavigationPolicy.js`.
4. Native provider-sensitive sign-in stays top-level.
5. Ordinary navigation chooses embedded local rendering first.
6. Backend Chromium becomes explicit fallback only, then later removable.

## Data grammar contract

A host DOM spec may contain only:

- `tag`: non-empty tag string,
- `ref`: optional unique identifier,
- `classes`: string or array of strings,
- `text`: string/number,
- `attributes`: plain object of scalar values,
- `properties`: allowlisted plain property object,
- `dataset`: plain scalar object,
- `children`: array of specs.

Forbidden fields:

- `html`,
- `innerHTML`,
- `outerHTML`,
- `onclick` or any `on*` key,
- function values inside specs,
- style strings.

Dynamic behavior is injected separately by host code after refs are manifested.

## Naming law

Names must be poetic but operationally specific.

Good:
- `keterChromeSpec`
- `binahManifestHostTree`
- `gevurahValidateNodeSpec`
- `yesodRefLedger`
- `malchusRenderedNode`
- `hodModeBadge`

Bad:
- `data`
- `thing`
- `el`
- `obj`
- `tmp`
- `x`
- mystical words with no semantic mapping.

## JSDoc law

Every meaningful function documents:

1. What it does.
2. Why the abstraction exists.
3. Parameters and types.
4. Return value.
5. Side effects.
6. Failure modes.
7. Security/trust boundary where relevant.
8. Its role in the wider browser architecture.
9. Poetic Awtsmoos imagery that illuminates the technical role rather than replacing it.

## CSS law

### Scope

Every selector in component CSS begins with `.awtsmoos-browser-host` or a component root already guaranteed to be under it.

No selectors for bare `button`, `input`, `textarea`, `canvas`, `iframe`, `html`, `body`, or `*` outside host scope.

### Mobile first

Base CSS must work at 280–360px browser-window widths without horizontal scrolling.

Wider features are enabled with `@media (min-width: ...)`.

### Interaction

Every interactive component receives:
- hover,
- active,
- focus-visible/focus-within,
- disabled state where applicable,
- selected/open/loading state where applicable.

### Motion

Use:
- transform,
- opacity,
- filter,
- background-position,
- box-shadow sparingly.

Avoid:
- layout-changing width/height animation on critical controls,
- large continuous animation loops,
- motion that obscures text or focus.

`prefers-reduced-motion: reduce` collapses durations and disables decorative loops.

### Overflow

No component may require viewport escape.

Explicitly verify:
- `min-width:0`,
- `min-height:0`,
- bounded drawer width,
- text ellipsis where appropriate,
- internal scroll containers,
- iframe clipping,
- safe-area padding where relevant.

## Verification gates

### Structural

- every touched source/test file <=120 lines,
- `style.css` contains only `@import` lines and comments,
- no unscoped component selector,
- no inline style strings in JS specs,
- no `innerHTML` in host UI substrate/components,
- no `on*` string handlers,
- no boring placeholder variable names in new/refactored modules.

### Syntax

- `node --check` every JS/MJS touched,
- CSS parser/lint check if existing tool available,
- no one-line compressed functions.

### Unit behavior

- host DOM spec validation,
- host DOM rendering/ref ledger,
- browser chrome refs,
- viewport mode switching,
- advanced drawer open/close,
- remote controls placement,
- compatibility contract.

### Browser/UI behavior

Use browser preview/Chrome only for the Awtsmoos Browser application itself, not as the backend renderer architecture.

Inspect:
- 320px width,
- medium Geelooy window,
- wide window,
- hover/active/focus-visible,
- drawer open/closed,
- no horizontal overflow,
- no unexpected overlap,
- iframe/page host clipping,
- reduced-motion media behavior where practical.

### Regression

Rerun:
- embedded containment,
- embedded network,
- native auth policy,
- proxy/profile,
- wider non-Chromium proxy/security,
- browser contract.

## Post-write review

After implementation:

1. reread every touched file,
2. write PLANNED vs ACTUAL vs DELTA,
3. list remaining architecture debt explicitly,
4. immediately begin coordinator-authority street if all UI/API gates are green.

The shell is not considered complete merely because it looks futuristic. It is complete only when its APIs are smaller, its data model is stronger, its styles are isolated, its interaction states are comprehensive, its mobile behavior is bounded, and its security architecture remains truthful.
