B"H
# Deeper Pass: Not Enough Yet

The first pass was not enough to call complete. A real `npm run test:css-quality` found a CSS ownership failure:

- `mobile-reader-vision.css` repeated `.post-reader-localized-context #virtual-scroll-container`
- `mobile-reader-vision.css` repeated `.post-reader-localized-context .awtsmoos-auto-scroll-floating`

This proves the quality gate is alive and the style work must be rewritten as a true single-owner layer.

## Second correction plan

1. Rewrite `mobile-reader-vision.css` so exact selectors do not repeat inside the file.
2. Avoid exact selector collision with existing ideal owners by using scoped mobile/desktop media variants and child selectors only where needed.
3. Rewrite `VirtualScrollOracle.js` so it does not merely keep appending chunks forever. It must prune far chunks.
4. Rewrite `scribe.js` to expose `unrenderChunk`, preserving approximate height before clearing DOM.
5. Extend the oracle test to cover prune decisions.
6. Run:
   - `npm run test:css-quality`
   - syntax checks
   - virtual scroll test
   - auto-scroll test
   - `npm run test:heichelos-quality`

## New runtime invariant

All section data remains in RAM. The DOM only holds chunks near the viewport, plus a safety radius. Far chunks return to placeholder vessels with preserved height.

Chapter 3: The Palace Learns Mercy

The Awtsmoos revealed that a palace is not perfected by adding endless gold to every wall. Sometimes perfection is restraint. A chamber that is not being visited should sleep. A selector that already has an owner should not be stolen. A floating button must bow before the letters. The river must move, but the river must not drown the shore.
