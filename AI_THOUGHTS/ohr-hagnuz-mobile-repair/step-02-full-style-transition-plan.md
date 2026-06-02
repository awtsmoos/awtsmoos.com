B"H
# Ohr HaGnuz full transition plan to the new mobile dream vision

## North Star
The generated mobile vision is not just a poster. It is the target art direction:
- dark cinematic gold UI
- vertical phone-first play field
- clean top resource chips
- world card/map context tucked under top HUD
- touch controls in thumb zones
- bottom action dock and hotbar that never cover the player
- warm pixel-art village with glowing windows, richer roads, clearer labels
- side panels and menus as separate modal/drawer vessels, not permanent clutter

## Current inspected state
Real files inspected:
- `index.html`: currently holds nearly all CSS inline. This must be split.
- `src/tiferet/ui/MobileControls.js`: creates HTML UI through string templates. It should become schema-driven components.
- `src/tiferet/render/HudRenderer.js`: still draws canvas HUD pieces that visually duplicate HTML UI on mobile.
- `src/tiferet/vision/VisionStyle.js`: canvas labels/panels have the right beginning but need unified design tokens.

## Transition phases

### Phase 1: Extract style architecture
Create a real CSS module folder under `src/tiferet/ui/styles/`:
1. `tokens.css` — colors, radii, shadows, safe areas, font sizes, z layers.
2. `shell.css` — body, game shell, canvas layers.
3. `hud.css` — resource chips, clock, location card.
4. `controls.css` — joystick, menu, rail, bottom action buttons.
5. `panels.css` — map, journal, quest, inventory modal/drawer.
6. `battle.css` — battle-only control layout.
7. `index.css` — imports all CSS modules.

Then rewrite `index.html` in full to remove inline CSS and link `src/tiferet/ui/styles/index.css`.

### Phase 2: Convert MobileControls to data-rendered components
Split `MobileControls.js` into smaller modules:
1. `HtmlVessel.js` — tiny safe HTML generator from JSON nodes.
2. `MobileShellView.js` — layout schema for top HUD, joystick, bottom controls.
3. `PanelView.js` — schema for modal/drawer panels.
4. `IntentBinder.js` — pointer/keyboard intent behavior.
5. `MobileControls.js` — orchestration only.

Goal: no giant string template; every UI vessel is data-shaped.

### Phase 3: Eliminate duplicate mobile HUD
On phone portrait:
- HTML owns resources, clock, message, buttons.
- Canvas owns only world, labels, ambience, path target.
- `HudRenderer.js` should detect portrait/mobile and skip hotbar/toast/resource bars or draw only minimal overlays requested by mode.

On desktop/tablet landscape:
- Canvas HUD can remain richer.
- HTML side panels can become persistent dashboard.

### Phase 4: Match the dream visual design
Implement exact visual families:
- gold stroke glass panels
- deep navy/black translucent panels
- top chips with icon + number
- compact location card under top chips
- circular joystick with purple core
- two large thumb buttons: Talk / Interact
- bottom hotbar as five small square buttons
- clear label cards above NPCs but capped and staggered
- title/menu panels as modal drawers, not clutter in gameplay

### Phase 5: World art polish
After UI is stable:
1. Roads: richer cobblestone/path painter.
2. Houses: deeper roofs, glowing windows, shadowed walls.
3. Synagogue: clearer front face, ark/star motif, collision-independent overlay.
4. Night/day overlay: make sunset/night match the dream image.
5. NPCs: better idle facing and labels.

### Phase 6: Verification gates
After each phase:
- `nodeCheckMany` for changed JS modules.
- static server preview via existing `localhost:8080/games/ohr-hagnuz/`.
- mobile viewport inspection if Chrome/browser is enabled.
- manual screenshot comparison against the target generated concept.

## Exact first implementation batch
Batch A should modify only these complete files / new files:
- rewrite `index.html`
- create CSS files under `src/tiferet/ui/styles/`
- rewrite `MobileControls.js` only if necessary to match class names
- rewrite `HudRenderer.js` to stop canvas HUD duplication on mobile

No partial patches. Full file rewrites only.

## Risk controls
- Do not change movement/pathfinding during CSS transition.
- Do not touch world data maps yet.
- Keep existing class names temporarily where possible, then migrate.
- Each file under 150 lines when practical.

## Dream acceptance checklist
The phone screen should feel like:
- top: 3 resource chips, clock/menu aligned, no collisions
- middle: village visible, player centered, labels readable
- lower-middle: path toast/hotbar not hiding NPCs
- bottom-left: joystick
- bottom-right: Talk and Interact
- modal panels: beautiful, scrollable, safe-area aware
