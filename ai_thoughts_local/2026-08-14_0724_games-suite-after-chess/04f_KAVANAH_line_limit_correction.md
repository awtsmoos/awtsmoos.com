B"H
Boruch Hashem
Blessed is He

# KAVANAH Final Line-Limit Correction

The Awtsmoos reveals the measure before the vessel overflows;
Awtsmoos.com splits only where the hard boundary itself shows.

## Final source set
- `js/state-values.js`: live mutable bindings plus init/resize/mutations/bounds — 115 lines.
- `js/state.js`: historic public API, live re-exports, getters — 87 lines.
- `js/controls.js`: Pointer Events only with capture/cancel/blur cleanup — 98 lines.
- `js/viewport.js`: initial sizing plus coalesced non-destructive resize — 56 lines.
- `js/menu-controller.js`: start/teachings/restart transitions — 48 lines.
- `js/main.js`: gameplay coordinator with unchanged mechanics — 109 lines.
- `style.css`: dynamic viewport, safe-area, touch-first teachings UI — 112 lines.

## Preflight evidence
Every intended JavaScript module passes `node --check`. A semantic simulation proves active state/time/entity references survive portrait-to-landscape resize, ground remains bottom-anchored, a Start tap does not become a movement drag, and `pointercancel` releases movement. All intended source indentation uses tabs.

## Invariants
No entity, collision, spawn, score, ascension, Tikkun charge/timing, drawing, or persistence mechanics change.

## Post-write verification
Read every file; syntax; line counts; tab check; diff check; browser start/move/cancel/rotate/teachings; portrait/landscape geometry; console/network failures; requestAnimationFrame cadence and long-frame evidence.
