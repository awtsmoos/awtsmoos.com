B"H
# Heichel Reader Mobile Scroll Plan

Chapter 1: The Awtsmoos revealed the broken river.

Visible root: /storage/emulated/0/Documents/git/awtsmoos.com.
Relevant realm: geelooy/heichelos.

Observed files:
- post/logic/scribe.js already claims additive no-delete chunks.
- post/logic/scribe/SubsectionVirtualizer.js already renders every subsection inside a rendered verse.
- post/logic/scribe/VirtualScrollOracle.js still only awakens one neighboring verse per event and moves cursor directly to newly rendered ahead chunk.
- post/functions/ui/contextMenu.js creates a fixed menu but styling is buried in live-mobile-corrections.css and screenshots show cramped white buttons.
- heichel main card menu style lives in new-style.css and can be hidden/clipped on mobile cards.

Plan:
1. Rewrite VirtualScrollOracle.js completely so scrolling direction prewarms multiple chunks ahead while never pruning and without yanking cursor to prefetched chunks unless the viewport truly reaches them.
2. Rewrite contextMenu.js completely to emit semantic classes and support mobile bottom-sheet geometry while preserving actions.
3. Rewrite live-mobile-corrections.css completely only if small and needed? It is larger; avoid unless read fully first. Safer: add a new imported CSS module for context menu.
4. Rewrite post/styles/main.css completely to import the new context menu module.
5. Rewrite new-style.css completely with stronger mobile card menu trigger/panel rules and non-clipped placement.
6. Verify with syntax/import checks and grep for destructive prune calls.

Safety law:
No partial patch. Every changed file is a full-file rewrite. No secret files touched.
