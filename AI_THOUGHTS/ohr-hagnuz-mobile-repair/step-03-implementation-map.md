B"H
# Step 3 implementation map: full mobile dream transition

## Files to create

CSS vessels:
- `src/tiferet/ui/styles/index.css`
- `src/tiferet/ui/styles/tokens.css`
- `src/tiferet/ui/styles/shell.css`
- `src/tiferet/ui/styles/hud.css`
- `src/tiferet/ui/styles/controls.css`
- `src/tiferet/ui/styles/panels.css`
- `src/tiferet/ui/styles/battle.css`

UI modules:
- `src/tiferet/ui/render/HtmlVessel.js`
- `src/tiferet/ui/render/UiText.js`
- `src/tiferet/ui/render/PanelRows.js`
- `src/tiferet/ui/render/ControlMarkup.js`
- `src/tiferet/ui/input/IntentBinder.js`

Files to rewrite complete:
- `index.html`
- `src/tiferet/ui/MobileControlSchema.js`
- `src/tiferet/ui/MobileControls.js`
- `src/tiferet/render/HudRenderer.js`

## Behavioral goal
HTML becomes the phone HUD. Canvas stops drawing duplicate resource bars/hotbar/toast on portrait/mobile, leaving the world visible.

## Verification
Run `nodeCheckMany` on every changed JS file and fetch live page on `localhost:8080/games/ohr-hagnuz/` to verify the CSS link and module entry are active.

## Safety
No map logic, movement, pathfinding, or world-data changes in this batch.