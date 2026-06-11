B"H

# Heichal Hishtalshelus Brawl Repair Plan

## Chapter 1: The Menu Gate
The game is visibly running but the player cannot orient or move. I will not guess. I will inspect the real files, find the current state flow, and rewrite only complete files when changes are needed.

## Known user goals
- Start with a clean grid main menu.
- Select character first.
- Select one of many maps next.
- Then enter the match with a countdown from 3.
- Make maps bigger.
- Add camera scrolling that follows the player.
- Make player identity obvious.
- Make movement work.

## Real project location
`geelooy/games/heichal-hishtalshelus-brawl`

## Visible structure
The project is already modular: controls, camera, maps, fighters, physics, render, systems.

## Inspection sequence
1. Read index.html, style.css, main.js, state.js, constants.js.
2. Read controls/input, keyboard, systems/controls, movement/integrate.
3. Read maps data and camera/render flow.
4. Decide whether to preserve current modules or create a stronger game-shell/menu module.
5. Rewrite complete files only.
6. Verify syntax with node or browser runtime.
7. Use browser/simulateRuntime against localhost if possible to confirm menus and countdown exist.

## Risk map
- Input may be wired but player not selected or focus lost.
- Camera may clamp against tiny world bounds, making movement invisible.
- Main loop may start instantly without state transitions.
- Canvas UI may not expose menus as DOM, so a DOM overlay might be safer.

## Intended architecture
- DOM overlay menu with grid cards for character selection and map selection.
- Match state machine: menu -> character -> map -> countdown -> playing.
- Larger maps defined in data/maps.js.
- Camera follows the chosen player with world bounds.
- Player marker rendered with `YOU` label and aura.

## Verification checklist
- No file over 150 lines when practical.
- All modified files rewritten fully.
- No placeholder code.
- `npm`/node syntax diagnostics pass if package supports it.
- Browser console has no immediate fatal errors.
