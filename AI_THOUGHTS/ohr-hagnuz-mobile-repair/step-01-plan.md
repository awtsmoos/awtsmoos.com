B"H
# Ohr HaGnuz mobile repair plan

Visible symptoms from the screenshots:

1. Hero walks left but still faces right.
2. Mobile HUD and HTML controls overlap the resource chips, world card, path toast, hotbar, and NPC labels.
3. Houses feel broken because architecture depth and label overlays compete with the player in a cramped portrait viewport.
4. Motion feels choppy because the old fixed 64px/4px movement path and canvas HUD overlap create visual stutter.

Inspected truth:

- The active app is `geelooy/games/ohr-hagnuz`.
- `src/tiferet/sprites/HeroSprite.js` maps left to `sideL`, but drawing does not mirror side-left. Side head/face always points right. First fix: mirror the body when view is `sideL`.
- `index.html` carries most mobile UI CSS inline. First safe layout fix: move menu below top chips, shrink side rail and action buttons on phones, hide/limit canvas HUD hotbar/toast collision zones with CSS-safe positions.
- `src/graphics/render/engine/RenderQueueBuilder.js` already sends `dir` to hero/NPC. Direction data exists; renderer is the broken vessel.
- `src/asiyah/logic/PathLogic.js` already sets `HR.dir = 'l'` for left path steps. Logic is probably not the first offender.

Step order:

1. Rewrite complete `HeroSprite.js` to mirror side-left and give NPC/player clearer direction silhouettes.
2. Rewrite complete `index.html` CSS with portrait-safe controls and canvas sizes preserved.
3. Run JS syntax/import check.
4. Run isolated behavioral test for left/right sprite transform where possible.
5. Then inspect architecture labels and depth if houses still look wrong.

No partial patching. Every modified file is rewritten in full.