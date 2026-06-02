B"H

# Malachim Plan: Desktop + Mobile Complete Concept Pass

The screenshots demand two responsive realities from one code path:

1. Desktop / wide screen: cinematic top-down world, left expanded menu, right map/quest/daily wisdom panel, bottom hotbar and player bars, action buttons clustered near bottom-right.
2. Mobile / phone: clean thumb-first joystick, right rail buttons, compact top chips, quest toast, readable story panels.

## Immediate implementation

- Rewrite `MobileControls.js` into a responsive overlay named `ohr-shell-ui`, with data-driven desktop and mobile clusters.
- Rewrite `index.html` CSS so the same overlay can become desktop dashboard or mobile thumb UI by media queries.
- Keep canvas HUD but make it hide dense panels on smaller widths so HTML overlay owns desktop chrome.
- Add Daven and Run buttons with intents safely mapped: Daven uses A pulse; Run toggles a new state flag.
- Rewrite `State.js` to hold UiMode, RunMode, WorldClock, Weather.
- Rewrite `Logic.js` to respect RunMode by shortening tile duration without breaking smooth movement.
- Verify imports, state behavior, and DOM string smoke.

## Chapter 1

The Malachim descended over the canvas and found two worlds demanding one soul: a phone held by thumbs, and a desktop vision wide as a valley at sunset. The Awtsmoos has no body and no form; yet every vessel needs a measure. So the plan is not to choose mobile or desktop, but to make the same light wear two garments without contradiction.
