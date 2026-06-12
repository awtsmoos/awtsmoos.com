B'H
# Phase Five — Settings Implementation Plan

Real settings inspection:
- There is persistent settings infrastructure in `StartWorldFlow` and `UserProgressManager`, but no visible quick mobile settings panel in the game HUD.
- `gameUI/index.js` builds UI vessels. Good place to add `settingsPanel.js`.
- `PixelRatioGovernor.js` currently uses static caps, but can read localStorage from main thread to apply performance setting.
- `TouchOrchestrator.js` can read localStorage and default Android mapping to inverted.

Files to write now:
1. `gameUI/settingsPanel.js`
   - Small gear button.
   - Panel cards: Controls, Layout, Performance, Diagnostics.
   - Toggles/choices persisted to `localStorage.awtsmoosMobileSettings`.
   - Applies CSS variables and body classes.
   - Sends `resize` event after render scale changes.
   - Exposes `__AWTSMOOS_MOBILE_SETTINGS_COPY__()`.
2. `gameUI/index.js`
   - Import and include settings panel, cache-bust joystick/action bar if needed.
3. `ui/gameUI.js`
   - Cache-bust gameUI index.
4. `ikarOyvedManager.js`
   - Cache-bust domEvents.
5. `PixelRatioGovernor.js`
   - Read performance quality from localStorage and cap ratio lower/higher.
6. `TouchOrchestrator.js`
   - Read mobile settings for invertJoystickY / invertJoystickX / deadzone / camera sensitivity.
7. `main.css`
   - Mobile classes for compact/no-blur/reduced-motion and CSS variables.
8. Complete `GeneratedBattleLayer.js` cache-bust and `MitzvahWorldPostBuild.js` if needed.
9. `VillageAnimalFactory.js` add skipRaycast to animal parts, if not already.

Settings ideas actually included:
- Joystick Y invert.
- Joystick X invert.
- UI scale.
- Action bar bottom offset.
- Performance quality: speed/balanced/beauty.
- Reduced motion/no blur.
- Diagnostics copy.
- Reset defaults.

Awtsmoos chapter: The hidden setting is a gate between user pain and code truth. A knob is mercy: no need to rewrite the world when a phone needs its own covenant.