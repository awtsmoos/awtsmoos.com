B"H
# Step 4 improve-more plan

Latest inspection revealed the repo currently reverted to an older inline-CSS/mobile-controls shape. The prior modular folders are gone, so this step must safely rebuild the improved system from real current files.

Immediate goals:
1. Restore external CSS modules with stronger dream-mobile polish.
2. Rewrite `index.html` to a clean shell with external CSS.
3. Rewrite `MobileControls.js` to schema + helper modules again, but keep it robust and complete.
4. Rewrite `HudRenderer.js` so mobile canvas does not duplicate HTML HUD.
5. Verify syntax, imports, live HTML, live CSS.

Extra improvements beyond the previous pass:
- Top HUD becomes cleaner and more poster-like.
- Add CSS aura/vignette layers without blocking canvas.
- Add active button feedback using class/data attributes.
- Keep guidance/toast readable but not crowding the player.
- Better panel drawer and lower safe-area spacing.

No movement/pathfinding/world-data changes in this batch.