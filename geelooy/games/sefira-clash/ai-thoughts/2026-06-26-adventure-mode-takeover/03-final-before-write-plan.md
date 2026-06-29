# B"H — Final Before-Write Plan

The existing project already has the first layer of the user's requested structure. The honest remaining implementation in this pass is to make Adventure Mode feel like a campaign instead of an unrestricted map grid.

Specific edits:

1. `sessionHelpers.js`: rewrite with cosmetic profile functions plus Adventure progress functions. Keep old exported names intact.
2. `menuViews.js`: rewrite with the same public exports, but level cards gain locked/completed/stars/best-time/hidden-sparks UI.
3. `main.js`: rewrite with current flow preserved, adding `adventureProgress`, `runStartedAt`, progression gating, and completion recording on human victory.
4. `css/menu.css`: rewrite expanded readable CSS, preserving large buttons, responsive scrolling, and adding lock/progress badge styles.

Non-goals in this pass:

- Do not replace combat.
- Do not mutate VS arenas.
- Do not invent procedural level generation.
- Do not collapse all level files into one file.

After writing, run import audits and reread changed files.
