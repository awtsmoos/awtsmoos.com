B"H
# Full transition plan: Ohr HaGnuz toward the new mobile dream CSS/style

## Goal
Move the live game from the current crowded in-game HUD toward the new tall mobile dream vision: cinematic pixel village, dark gold glass shell, clean top resource row, compact menu, bottom thumb controls, focused quest/journal panels, and fewer canvas/UI collisions.

## Non-negotiables
- No partial patches. Rewrite every edited file fully.
- Split large CSS and UI into small modules.
- Keep app runnable after every phase.
- Verify syntax/imports after every phase.
- Prefer data-driven UI schemas over hardcoded HTML strings.

## Phase 1: Extract inline CSS into style modules
Current issue: `index.html` owns a large inline style block. This makes style iteration risky.

Files to create:
- `src/style/ohrTheme.css`
- `src/style/ohrShell.css`
- `src/style/ohrMobileHud.css`
- `src/style/ohrPanels.css`
- `src/style/ohrDesktop.css`
- `src/style/ohrBattle.css`
- `src/style/index.css`

Rewrite:
- `index.html` to remove inline CSS and load `./src/style/index.css`.

Verification:
- Load page through `8080/games/ohr-hagnuz/`.
- Confirm CSS network path works.
- `nodeCheckFile src/index.js`.

## Phase 2: Create design-token bridge for canvas + DOM
Current issue: DOM CSS and canvas `VisionStyle.js` use separate token systems.

Files to create:
- `src/style/DesignTokens.js`
- `src/style/DesignTokenCss.js`

Rewrite:
- `VisionStyle.js` to import JS tokens.
- CSS theme variables should match the generated mockup: dark midnight glass, gold borders, warm text, violet action glow, blue interact glow.

Verification:
- Ensure no import cycles.
- Canvas labels/chips match DOM panels.

## Phase 3: Replace MobileControls HTML string with data-driven renderer
Current issue: `MobileControls.html()` is one long template. Hard to evolve into the new poster layout.

Files to create:
- `src/tiferet/ui/html/HtmlNode.js`
- `src/tiferet/ui/html/renderNode.js`
- `src/tiferet/ui/layout/MobileDreamLayout.js`
- `src/tiferet/ui/layout/DesktopDreamLayout.js`
- `src/tiferet/ui/layout/BattleDreamLayout.js`

Rewrite:
- `MobileControls.js` into a small coordinator.
- `MobileControlSchema.js` if needed to expose better labels/icons.

Verification:
- Buttons still emit `AwtsmoosIntents`.
- Talk/interact still works.
- Panel open/close still works.

## Phase 4: Mobile-first screen architecture
Implement the dream image structure in live UI:

Top:
- resource chips left
- time/status center-right
- hamburger top-right

World overlay:
- tiny location card below chips
- no giant guidance box by default
- NPC labels capped and non-overlapping

Bottom:
- joystick lower-left
- talk/interact lower-right
- hotbar centered above bottom controls
- toast above hotbar, not over NPCs

Panels:
- full-screen drawer style for Menu, Map, Journal, Quests
- mini-map and quest tracker in modal cards, not always visible on phones

Files affected:
- CSS modules from phase 1
- `MobileControls.js`
- `HudRenderer.js`
- `HudWidgets.js`
- `HudPanels.js`
- `WorldLabels.js`

Verification:
- Portrait 390x844 visual smoke.
- Short screen 390x720 smoke.
- Landscape/desktop smoke.

## Phase 5: Make canvas HUD subordinate to DOM HUD on mobile
Current issue: both canvas and DOM draw HUD-like elements.

Rewrite:
- `HudRenderer.js` so mobile canvas only draws message/hotbar if DOM is not handling it.
- Or move hotbar fully into DOM and leave canvas for world only.

Preferred path:
- DOM owns resource row, controls, panels, quest cards.
- Canvas owns world, labels, path target, particles, optional toast only.

Verification:
- No duplicated chips or clock.
- No overlap with browser URL bar safe area.

## Phase 6: Visual world upgrade to match dream art
After UI is clean:
- tune `Ground.js` colors darker/richer
- tune `Architecture.js` roofs/windows/glow
- tune NPC/player scale/readability
- add twilight ambience presets
- fix house depth and door silhouettes

Files likely affected:
- `Ground.js`
- `Architecture.js`
- `ObjectRenderer.js`
- `WorldAmbience.js`
- `HeroSprite.js`
- `Human.js`

Verification:
- Screenshots at town, synagogue, night, well.

## Phase 7: Testing harness
Create a local visual checklist script/data file:
- start positions for village, synagogue, house door, NPC cluster, night path, well
- each scenario should set map/hero/time and allow screenshot inspection.

Files:
- `src/dev/VisualScenarioData.js`
- extend existing `OhrTestHarness.js` or add isolated dev-only helper.

## Suggested immediate next edit
Begin with Phase 1 only: extract CSS into modules and rewrite `index.html`. This is safest because it changes presentation organization without changing game logic.
