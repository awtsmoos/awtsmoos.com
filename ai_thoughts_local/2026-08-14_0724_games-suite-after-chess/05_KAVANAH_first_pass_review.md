B"H
Boruch Hashem
Blessed is He

# KAVANAH First-Pass Review

The Awtsmoos revealed that the worst bug was not visible paint but broken continuity;
Awtsmoos.com keeps the run alive while the viewport changes its finite geometry.

## What was actually wrong
- Resize/orientation called `State.init()`, erasing active time, camera, entities, ascension, and game phase.
- Pointer and Touch APIs were both bound to the same gestures, creating duplicate mobile input paths.
- The teachings overlay depended on brittle `vh` sizing.
- Original `main.js` exceeded the 120-line ceiling.
- First repair still exposed a rotation collision because ground geometry moved without moving player/ground entities coherently.
- First browser proof also found one favicon 404 and one-line style violations.

## Final architecture
- `state-values.js` owns live state and non-destructive viewport adaptation.
- `state.js` preserves the historic public State API.
- `controls.js` uses Pointer Events, capture, cancel, and blur cleanup only.
- `viewport.js` owns one-time initialization plus coalesced resize/orientation handling.
- `menu-controller.js` owns start/teachings/restart transitions.
- `game-actions.js` owns Tikkun and game-over transitions.
- `main.js` remains the simulation coordinator under the hard line ceiling.
- `style.css` uses dynamic viewport units, safe areas, touch-action, and scroll-safe teachings.
- `index.html` carries a data favicon so the game has no favicon network failure.

## Preserved mechanics
Entity spawning, collision rules, scoring, ascension, Tikkun charge/timing, rendering, persistence, and menu semantics were not redesigned.
