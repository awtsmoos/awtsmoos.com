B"H
# Android Intense Pass Post Review

## Implemented
- Switched to live Android tunnel `awt-u0_a300-26940` at `/storage/emulated/0/Documents/git/awtsmoos.com`.
- Added `js/platform/mobileProfile.js` for Android/coarse-pointer detection.
- Added `js/controls/touchAimMemory.js` so button attacks preserve last joystick aim after thumb release.
- Rewrote `touchJoystick.js` with curved analog movement, dynamic radius, remembered aim, down-dive support, and pointer-safe listeners.
- Rewrote `touchButtons.js` for Android pointer-id reliability across punch, kick, grab, shield, and special.
- Rewrote `input.js` to merge keyboard, mouse, touch, and remembered touch aim.
- Rewrote `index.html` with grab/shield/special Android buttons and viewport-fit cover.
- Rewrote `style.css` for safe-area insets, dvh, larger Android controls, held-button feedback, landscape compact mode, and control hints.
- Rewrote `offscreenSurface.js` to disable extra backbuffer on Android and lower smoothing cost.
- Rewrote `main.js` to apply mobile profile, cap DPR to 1 on Android, update status/menu instructions, and resize after orientation changes.

## Verification
Line counts:
- `mobileProfile.js`: 27
- `touchAimMemory.js`: 20
- `touchJoystick.js`: 47
- `touchButtons.js`: 39
- `input.js`: 51
- `offscreenSurface.js`: 42
- `main.js`: 82

Simulation audit:
- `node tools/reforge-audit.mjs --count 3 --frames 900 --bots 4`
- ok true
- warnings none
- invalidAttackCommands 0
- averageDamagePerMinute 196
- totalKos 6

AI sim:
- `node tools/simulate-ai-match.mjs --count 3 --frames 900 --bots 4 --fast`
- ok true
- warnings none
- invalidAttackCommands 0
- namelessJumps 0

## Remaining Android-only manual checks
- Real browser thumb feel must still be physically tested: multi-touch punch+joystick, hold charge release, shield hold, special recovery, orientation switch, and bottom safe-area spacing.
- Chrome automation was unavailable on this Android tunnel (`chrome.enabled=false`), so verification used syntax and Node simulation harnesses.

## Chapter close
The phone is no longer a cramped window into a desktop game. It has its own profile, its own remembered thumb-angles, its own full combat buttons, and its own low-waste render path. The arena now fits inside the hand with fewer ghosts from the browser and more fire from the thumb.
