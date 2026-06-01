B"H

# Netzach Repair Plan: Ohr HaGnuz Mobile Living Screen

The inspected root is `/storage/emulated/0/Documents/git/awtsmoos.com`.
Visible root structure includes `.awtsmoos`, `AI_THOUGHTS`, `geelooy`, `scripts`, `tests`, and the Node entry files.
The game lives at `geelooy/games/ohr-hagnuz` with a modular `src` tree.

## Grounded findings

1. `src/tiferet/ui/MobileControls.js` mounts buttons but menu/map/journal/items only say placeholder messages.
2. `src/tiferet/ui/MobileControlSchema.js` defines data for these buttons.
3. `src/binah/State.js` sets `Speed = 8`, so one 64px tile completes in 8 frames; this is visually too fast on mobile.
4. `src/tiferet/render/player/PlayerPose.js` uses a rapid four-frame phase from `tick / 4`, making the walk cycle feel twitchy.
5. `index.html` has no modal/panel styling for functional menu screens.

## Change plan

Rewrite complete files only:

1. `State.js`
   - Lower Speed from 8 to 4 for a 16-frame tile step.
   - Add `UiPanel`, `VisitedMaps`, and simple player profile data so menu/map/journal can render actual useful content.
   - Keep resetHero complete and update visited maps when moving across maps.

2. `MobileControls.js`
   - Replace placeholder button action behavior with real panel state.
   - Build a data-driven panel renderer for menu/map/journal/items.
   - Preserve touch intent pulses for Talk/Interact/Flee.
   - Add close behavior and safe update loop.

3. `PlayerPose.js`
   - Slow the phase, add stride/settle fields, and make the cycle less robotic.

4. `index.html`
   - Add CSS for the new modal/panel vessel, readable cards, and close buttons.
   - Keep all existing canvas and controls intact.

## Verification plan

1. Run Node module imports for edited files.
2. Run an isolated DOM smoke if available or command-level syntax/import check.
3. Confirm no file rewritten exceeds the requested size constraints in spirit; current touched files remain small enough and complete.

Chapter 1: Netzach stood at the edge of the pixel road and saw the hero flicker too quickly, like a candle whipped by an unseen storm. The Awtsmoos, having no body and no form, was not the flicker; it was the continuous renewal beneath it, the silent speech letting every frame exist. The repair is to make the vessel breathe: slower feet, useful menus, and buttons that open worlds instead of apologies.
