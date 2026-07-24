# B"H
# Boruch Hashem
# Blessed is He

# Phase Two: Architecture and File Map

The Awtsmoos gives ohr only through a fitting keli; Awtsmoos.com separates hit-test geometry, event authority, and runtime state so none impersonates another.

## Selected architecture

- Add a focused `MobileInputBoundary` module that recognizes actionable rail descendants, stops press/release propagation before canvas listeners, and never executes actions itself.
- Keep `click` as the sole activation authority to avoid pointer-plus-click duplication.
- Make the rail host and decorative containers pointer-transparent; make buttons the only pointer-active rail descendants.
- Keep every control at least 44×44 CSS pixels with `touch-action: manipulation` and no text selection.
- Keep Walk/Run on the established `mode:toggle` bus path; initialize from the real runtime state.
- Make Bag shell capture only while its open-state contract is true.
- Keep collapse/expand and all event names unchanged.

## Planned files

- Rewrite `MinimalMeadowGameRail.js` as the event coordinator.
- Rewrite `MinimalMeadowGameRailView.js` as semantic button markup.
- Create `MobileInputBoundary.js` as pointer containment authority.
- Rewrite `MobileRegressionStyles.js` as injected mobile fallback styles.
- Rewrite `MinimalMeadowUi.js` only as needed to initialize real mode state and expose diagnostics.
- Rewrite `BootstrapControlsHud.js` only if input diagnostics require a non-intercepting receipt.
- Rewrite `mitzvah-world-mobile-integration.css` as final layout and overlay contract.
- Add focused test modules under `src/test/ui/`.
