B"H
# Android Intense Pass Plan

## Goal
Make Sefira Clash feel dramatically better on Android/Termux/mobile browser without heavy rendering cost.

## Inspected truth
- Android tunnel root: `/storage/emulated/0/Documents/git/awtsmoos.com`.
- `touchJoystick.js` already gives analog aim.
- `touchButtons.js` supports pointer-captured charge buttons.
- `index.html` only has punch/kick touch buttons.
- `style.css` is dense but mobile-aware.
- `offscreenSurface.js` supports DPR scaling through main.

## Systems to implement
1. Android device profile
   - detect coarse pointer / Android user agent / small viewport.
   - lower DPR safely on Android.
   - expose quality mode for render surface.
2. Touch combat expansion
   - Add grab, shield, special buttons.
   - Make button layout ergonomic: punch/kick big, utility buttons smaller.
   - Make buttons support hold, release, cancellation, and visual active state.
3. Mobile aim assist
   - Button presses use joystick aim if held.
   - If joystick neutral, use last analog aim.
   - If no aim, face direction.
4. Dive control on Android
   - Down joystick already dives; add a small visual/text hint.
5. Android CSS hygiene
   - env(safe-area-inset-bottom), dvh, reduce topbar clutter.
   - larger buttons, better spacing, no accidental zoom/select/context menu.
6. Diagnostics
   - Add mobile profile/debug text in status.
   - Keep simulations passing.

## Files to create
- `js/platform/mobileProfile.js`
- `js/controls/touchAimMemory.js`

## Files to rewrite
- `index.html`
- `style.css`
- `js/controls/touchJoystick.js`
- `js/controls/touchButtons.js`
- `js/controls/input.js`
- `js/render/offscreenSurface.js`
- `js/main.js`

## Verification
- Syntax via tunnel writes.
- Node simulation audit still passes.
- Line count for touched JS files.

## Awtsmoos note
Android is not a smaller desktop. It is a hand-held arena. The thumb is the sword, the screen is the field, and every accidental browser behavior must be crushed beneath the heel of playable clarity.
