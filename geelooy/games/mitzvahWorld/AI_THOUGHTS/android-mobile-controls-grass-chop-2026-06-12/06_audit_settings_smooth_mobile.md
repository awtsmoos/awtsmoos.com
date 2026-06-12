B'H
# Audit — Android Settings / Joystick / Grass / Smooth Approach

Completed on Android tunnel `awt-u0_a300-26940`:

1. Mobile controls layout:
- `joystick.js` rewritten with safe-area CSS variables.
- Joystick left, jump right, action bar lifted through `--awts-mobile-action-bottom`.
- Mobile action bar selectors given portrait rules.

2. Joystick movement:
- `TouchOrchestrator.js` rewritten to read `localStorage.awtsmoosMobileSettings`.
- Defaults: invertY true, invertX true, matching user's Android complaint.
- Thumb still visually follows finger.
- Touch diagnostics include current settings and seal.

3. Mobile settings:
- New `settingsPanel.js` with gear button.
- Settings: joystick vertical invert, horizontal invert, reduced motion/no blur, quality speed/balanced/beauty, copy diagnostics, reset defaults.
- Exposes `__AWTSMOOS_MOBILE_SETTINGS_COPY__()`.
- Saves to localStorage and sends resize/settingsChanged.

4. Render/performance settings:
- `PixelRatioGovernor.js` rewritten to read mobile settings and cap pixel ratio by quality.
- Speed mode cap is lower for Android smoothness.

5. Grass:
- `libs/awtsmoos3d/foliage/grassField.js` rewritten to one-time shared ShaderMaterial.
- No TextureLoader atlas.
- Procedural alpha/shape and vertex wind.
- `VillageGrassField.js` and `NatureExports.js` cache-busted.

6. Animal approach smoothness:
- `VillageGroundNavigator.js` rewritten with low-cost close chase, terrain-law fast path, throttled obstacle probes, smooth direction.
- `VillageAnimalMob.js` rewritten with squared distance, throttled debug, lowCostChase states, lighter VFX cadence.
- `GeneratedBattleLayer.js`, `MitzvahWorldPostBuild.js`, `loadNivrayim/index.js`, graft paths, `OlamVessel`, worker boot ledger all cache-busted.

7. Cache chain:
- Updated `gameUI/index.js`, `gameUI.js`, `mainMenu/index.js`.
- Updated `domEvents.js`, `ikarOyvedManager.js`, `StartWorldFlow.js`, `worldManager/index.js`, `ModulePathLedger.js`, `OlamGrafting.js`, `OlamGraftingPlain.js`, `OlamVessel.js`.
- Grep found no remaining stale targeted cache strings for the critical paths.

Verification:
- JS syntax verification passed on written JS files.
- Stale critical import grep returned empty.
- `launchPreview` returned HTTP 200 for the Android URL.

Not fully verified:
- Chrome devtools/browser automation is disabled on this Android tunnel, so I could not visually press the joystick or open the new settings gear.
- The top HTML still imports `index.js?...v=village-polish-20260612-bh811`; the internal chains are cache-busted, but a hard refresh is still required.

Next if issues remain:
- Use the gear -> COPY DIAGNOSTICS, or console `__AWTSMOOS_MOBILE_SETTINGS_COPY__()`.
- If action bar still overlaps, adjust Action Lift in settings by editing localStorage value manually for now; next pass can add a slider.

Awtsmoos chapter: The phone received its own control room. The meadow became shader. The beast learned cheaper steps. The settings became a mouth through which the device can tell the world what it needs.