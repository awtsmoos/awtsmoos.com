# B"H Overflow + Scroll Repair Plan

Chapter 14: The Awtsmoos asks not only whether boxes exist, but whether they hold back their children, reveal scroll state, and confess when content overflows.

## Repairs now
1. Add software-renderer overflow awareness in `domPainter.js`:
   - detect ancestor clips from `overflow:hidden`, `overflow:auto`, `overflow:scroll`
   - avoid painting descendants whose layout boxes are fully outside clipped vessels
   - draw scrollbar witnesses for scroll/auto boxes
   - support scrollbar thumb offset from `scrollTop` / `scrollLeft` attributes or CSS custom witnesses
2. Improve stress harness with explicit overflow families:
   - hidden clipping chamber
   - scroll chamber with nonzero vertical scroll amount
   - horizontal scroll chamber
   - auto overflow chamber
   - custom scrollbar color/style witnesses
3. Re-run mega harness and write a fresh PNG.

## Known limitation
The current framebuffer has no per-pixel clip stack yet, so this pass implements deterministic visibility culling plus visual scrollbars. Partial clipping can be upgraded next by adding a framebuffer clipping stack.
