B"H

# Ownership and idempotency implementation completed

Implemented all bulkread findings.

## CSS ownership cleanup
- `geelooy/style/heichelos/heichel/hero.css` now owns only hero body/crown styles.
- `geelooy/style/heichelos/heichel/search.css` now owns only sticky search/filter styles.
- `geelooy/style/heichelos/heichel/bottom-nav.css` now owns only bottom navigation.
- `geelooy/style/heichelos/heichel/series-list.css` is now a compatibility wrapper importing focused card modules.
- `geelooy/style/heichelos/heichel/mobile.css` is now a compatibility wrapper importing `responsive.css`.

## Home pointer actualization
- Added `geelooy/style/social/home/beauty/atmosphere/pointer-light.css`.
- Rewrote `geelooy/style/social/home/beauty/atmosphere/index.css` to import it.
- The existing Home pointer JS now has real CSS consuming `--home-pointer-x` and `--home-pointer-y`.

## Reader/Heichel JS idempotency and performance
- `currentSectionTracker.js` now disconnects previous observers and works in Node tests without `window`.
- `progressSpine.js` now caches a chunk signature and skips identical marker rebuilds.
- `reader beauty/index.js` refreshes safely without multiplying watchers.
- `scrollBlockerDetector.js` now caches expensive scans.
- `postLogic.js` repairs/refreshes beauty often but runs heavy diagnostics only at start and after delayed repairs.
- `heichel/modules/beauty/index.js` now returns the existing active state instead of overwriting cleanup handles.

## Tests added
- `heichelNoDuplicateOwnership.test.mjs`
- `homePointerContract.test.mjs`
- `idempotency.test.mjs`

## Verification passed
- cssImportGraph.test
- cssSmallModuleBudget.test
- noFixedReaderShell.test
- templateVersionContract.test
- beautyImportGraph.test
- beautyModuleBudget.test
- noBeautyGlobalTrap.test
- beautyTemplateContract.test
- heichelNoDuplicateOwnership.test
- homePointerContract.test
- renderCountVerifier.test
- modalHealth.test
- scrollHealth.test
- scrollHeroState.test
- currentSectionTracker.test
- progressSpine.test
- idempotency.test
- node --check postLogic.js
- node --check heichel/app.js
- node --check Home beauty index.js
- ReaderWheelBridge.test
- scrollContract.test

## Remaining honest note
Node still prints MODULE_TYPELESS_PACKAGE_JSON warnings for ES modules because package.json does not declare `type: module`; these are warnings, not failures. I did not change package.json because that could alter broader runtime semantics.
