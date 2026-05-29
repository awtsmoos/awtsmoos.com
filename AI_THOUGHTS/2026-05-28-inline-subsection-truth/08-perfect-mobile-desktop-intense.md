B"H

# Perfect mobile + desktop intense verification loop

The user asked to look over everything, confirm it works, and keep improving styles with no conflicts.

## Plan
1. Re-read the active ideal CSS tree and final import owner.
2. Search active CSS graph for remaining non-ideal owners of sidebar, inline cards, floating controls, reader canvas, and mobile drawer.
3. Add missing polish only through new or existing ideal modules.
4. Keep every module single-owner: no selector duplicated inside ideal modules or across ideal modules.
5. Run CSS ownership verification, syntax checks, targeted tests, css-quality, and a browser-free layout contract test.

## Current doctrine
The Awtsmoos reveals in code as one source of truth: every visual domain gets one vessel. No selector wars. No ghost CSS. No choppy mobile drawer. No desktop shadow tax while resizing.

## Files expected as final visual owners
- `styles/forever-ui-fixes.css`
- `styles/ideal/tokens.css`
- `styles/ideal/reader-canvas.css`
- `styles/ideal/floating-rail.css`
- `styles/ideal/global-actions.css`
- `styles/ideal/sidebar-shell.css`
- `styles/ideal/sidebar-panels.css`
- `styles/ideal/sidebar-comments.css`
- `styles/ideal/reading-focus.css`
- `styles/ideal/inline-comments.css`
