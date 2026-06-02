B"H
# Step 6 plan: houses, NPCs, mobile and desktop UI better again

Current inspected truth:
- `Architecture.js` is improved but still tile-local; houses can still read as stacked squares. Improve with roof ridges, edge seams, lighter facade language, and cleaner doors.
- `Human.js` supports direction but needs stronger silhouettes, integer color shading, beards/side faces, less generic body shape.
- `GlyphRenderer.js` can pass variant and direction, but crown badge can be more subtle.
- `WorldLabelRenderer.js` caps labels but should adapt top/bottom guards for mobile/desktop and avoid controls better.
- `MobileControls.js` is still older inline-template UI; improve with top stat chips, desktop side HUD, run toggle, held-state feedback, and cleaner panels.
- `HudRenderer.js` still draws canvas HUD on mobile; move canvas HUD to desktop-only so mobile HTML/UI/world labels do not stack.

Batch:
1. Rewrite `Architecture.js` fully.
2. Rewrite `Human.js` fully.
3. Rewrite `GlyphRenderer.js` fully.
4. Rewrite `WorldLabelRenderer.js` fully.
5. Rewrite `MobileControlSchema.js` and `MobileControls.js` fully.
6. Rewrite `HudRenderer.js` fully desktop-only.
7. Rewrite `index.html` CSS fully for mobile and desktop layout.
8. Verify syntax + module imports + live page.