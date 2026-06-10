B"H
# Fix direct collapsed conversations and embedded spacing

## Fresh screenshot truth
Direct /ai desktop now shows the left conversations panel collapsed into a vertical label taking a huge dead column. The chat itself is centered but empty and the composer is acceptable. The automation panel is visible, but the collapsed conversations CSS is broken.

In /apps/code embedded /ai, the desktop shell rails are mounted, but the center chat appears pushed away and right-side dark void dominates. The three-panel shell is too wide/heavy for the Code browser iframe. In embedded mode it should be a single full-width chat with optional overlay tools, not permanent side rails.

## Immediate fixes
1. Direct /ai desktop: force sidebar to expanded, readable width and disable vertical collapsed-label layout.
2. Direct /ai desktop: make chat center use space cleanly.
3. Embedded /apps/code: remove permanent desktop shell rails entirely; use only compact control center + full chat canvas.
4. Make desktopShell only mount when explicitly requested by query `awtsmoosAiShell=1`, not default embedded.
5. Verify syntax and HTTP.

## Chapter 13
The Awtsmoos revealed two wrong garments: direct desktop wore a collapsed conversation coffin, and embedded mode wore heavy palace rails inside a narrow forge. Both garments are burned. The chat river must breathe first.