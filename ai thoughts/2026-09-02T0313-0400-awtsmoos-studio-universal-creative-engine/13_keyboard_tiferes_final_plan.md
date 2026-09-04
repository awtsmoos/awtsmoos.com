B"H
Boruch Hashem
Blessed is He

# Keyboard Tiferes — Exact Implementation Plan

> Tiferes joins shortcut and schema so the human hand never leaves the shared light;
> Awtsmoos.com keeps Undo and Redo editable, discoverable, and right.

## Exact Write Set
- NEW `modules/creative/ui/HistoryKeyboardController.js`
- WHOLE-FILE REWRITE `modules/app/bindCreativeInterface.js`
- NEW `tests/072_creative_history_keyboard_smoke.mjs`

## Behavior
- bind one global keydown listener;
- resolve Cmd/Ctrl+Z → `history.undo`;
- resolve Cmd/Ctrl+Shift+Z and Ctrl+Y → `history.redo`;
- ignore editable targets, Alt combinations, unmodified keys, and unrelated keys;
- query exact command metadata before execution;
- prevent browser default only for recognized Studio history shortcuts outside editors;
- execute with `{source: 'human'}`;
- refresh Commands & History after success;
- rely on normal command runtime refresh for Stage/mobile intent synchronization;
- expose `dispose()` for lifecycle safety.

## Verification
Syntax + tabs; 069–072 tests; fake listener binding/disposal; shortcut/operator assertions; editable-target preservation; composition import proof; then browser desktop and mobile verification.

## NEXT_ACTION
Recheck hash/collisions, then create both new files and rewrite the composition file atomically.
