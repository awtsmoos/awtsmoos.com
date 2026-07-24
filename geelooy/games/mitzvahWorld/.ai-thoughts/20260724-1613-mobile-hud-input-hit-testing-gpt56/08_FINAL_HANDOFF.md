# B"H
# Boruch Hashem
# Blessed is He

# Final Handoff — Mobile HUD Input and Hit Testing

The Awtsmoos, beyond every visible rail and invisible boundary, recreates the player, the pointer, and the world in one instant. Awtsmoos.com receives this handoff as a measured vessel: the menu now answers at its painted centers, while empty air returns to the world beneath it.

## Defects corrected

1. Rail hosts and gaps no longer intercept input outside visible controls.
2. Decorative button children cannot become separate hit-test authorities.
3. Rail-originated pointer phases stop before canvas targeting or joystick/camera paths.
4. Native delegated click is the only action execution event, preventing pointer-plus-click duplication.
5. Every actionable rail target is exactly or at least 44 by 44 CSS pixels in the mobile contract.
6. Walk remains visible when secondary actions collapse.
7. Walk/Run mutates the real `runtime.runToggle` state and updates from `mode:changed`.
8. Closed Bag state captures nothing; open Bag state captures intentionally.
9. Rail stacking is above canvas and ordinary HUD while its pointer-active footprint is limited to buttons.
10. Collapse/expand and all existing secondary action event names are preserved.

## Production files written

- `experiments/Awtsmoos/src/ui/MobileInputBoundary.js`
- `experiments/Awtsmoos/src/ui/MinimalMeadowGameRailView.js`
- `experiments/Awtsmoos/src/ui/MinimalMeadowGameRailModeRuntime.js`
- `experiments/Awtsmoos/src/ui/MinimalMeadowGameRailUiRuntime.js`
- `experiments/Awtsmoos/src/ui/MinimalMeadowGameRail.js`
- `experiments/Awtsmoos/src/ui/MobileRegressionStyles.js`
- `experiments/Awtsmoos/src/app/MinimalMeadowUi.js`
- `styles/mitzvah-world-mobile-integration.css`

`experiments/Awtsmoos/src/app/BootstrapControlsHud.js` was inspected and intentionally left unchanged.

## Focused tests added

- `experiments/Awtsmoos/src/test/ui/MobileHudInputTestDoubles.mjs`
- `experiments/Awtsmoos/src/test/ui/mobileHudInputActivation.test.mjs`
- `experiments/Awtsmoos/src/test/ui/mobileHudInputAcceptance.html`
- `experiments/Awtsmoos/src/test/ui/MobileHudAcceptanceDriver.js`
- `experiments/Awtsmoos/src/test/ui/MobileHudConsoleCapture.js`
- `experiments/Awtsmoos/src/test/ui/mobileHudInputAcceptance.js`
- `experiments/Awtsmoos/src/test/ui/MobileHudCdpSession.mjs`
- `experiments/Awtsmoos/src/test/ui/mobileHudChromeAcceptance.mjs`

## Verification summary

- Syntax checks: passed for all touched JavaScript and MJS files.
- Node regressions: `14 passed`, `0 failed`.
- Real Chrome acceptance: passed at exactly `390 by 844` CSS pixels.
- Center checks: `220 of 220` intended.
- Event counts: every rail event exactly `20`.
- Real movement toggles: `20 of 20` changed runtime state.
- Bag transitions: `40` correct open/close transitions.
- Joystick: nonzero drag vector and zero vector after release.
- Accidental world events: `0`.
- Browser exceptions, rejections, and console errors: `0`.
- Minimum hit target: `44 by 44` CSS pixels.
- Pointer phases contained at rail boundary: `400`.
- `git diff --check`: clean.
- Executable file ceiling: all touched source and tests at or below `120` lines.

## Final production SHA-256

- `MobileInputBoundary.js`: `4c4014c4eeddd6305df7e55aa00e3126b9a662f595863f066b726373bcb6178f`
- `MinimalMeadowGameRailView.js`: `6c509f1dc336b96646a94ee292336199f66cb48d2a333f8600e22ed929956418`
- `MinimalMeadowGameRailModeRuntime.js`: `86688adad539e5a38bc5939694964d4b9e7494551917239ea6710d7aa4afbab5`
- `MinimalMeadowGameRailUiRuntime.js`: `cd93b27b7cbda6030543672d1474f91c52385234253142790facccd604e9060d`
- `MinimalMeadowGameRail.js`: `dc46e0919b7c6727a0a8d2a14a28f114e1ceaab1ea7b83f53d8a46d42568aec1`
- `MobileRegressionStyles.js`: `57911e2ee2e42120c3d3ddfa9c8417bb054d577d0adadeb4bc325c188d108e53`
- `MinimalMeadowUi.js`: `a8dddcf92ee9ea5a930c99f1e97bad94babc5dc948cda356045cc9c1bca588d6`
- `BootstrapControlsHud.js` unchanged: `bf77021baf5d68c0363d8af1a3e2fcc158753386edb3e40053eb9a3e8821d60b`
- `mitzvah-world-mobile-integration.css`: `db25b375eaece5f2dbe89af6dda67714086e48c93d2e2b389e364ddab618c22b`

## Repository state

No commit was created. The repository was already extensively dirty from concurrent agents across many unrelated systems. Those changes were neither reverted nor modified by this bounded task.
