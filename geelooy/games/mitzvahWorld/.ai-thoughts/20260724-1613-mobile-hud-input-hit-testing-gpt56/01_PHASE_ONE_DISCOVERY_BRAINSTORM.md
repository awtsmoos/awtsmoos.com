# B"H
# Boruch Hashem
# Blessed is He

# Phase One: Discovery Brainstorm

The Awtsmoos is beyond pointer and target while recreating both; Awtsmoos.com gives the investigation a measured vessel.

## Candidate causes to prove or reject

1. A fixed host spans more area than the visible rail.
2. A transparent rail or secondary container receives pointer events between controls.
3. Conflicting mobile styles switch the rail between grid and scrolling column layouts.
4. The canvas or joystick captures a pointer whose press began on a rail descendant.
5. Touch scrolling cancels activation because actionable controls lack `touch-action: manipulation`.
6. Delegated click lookup accepts descendants but lacks a pointer boundary on press and release.
7. Bag shell remains interactive while visually closed.
8. Overlay stacking contexts place another HUD above the rail despite its visible paint.
9. Both pointer and click handlers execute one action twice.
10. Collapse state changes geometry while a synthetic activation sequence is in flight.

## Evidence obligations

- Trace pointerdown, pointerup, click, pointer capture, touch-action, and delegation.
- Measure every button center and call `elementFromPoint` there.
- Count exactly one emitted event per activation over twenty repetitions.
- Verify Walk/Run changes the real runtime state on every repetition.
- Verify Bag closed state is pointer-transparent and open state intentionally captures.
- Verify joystick drag still produces movement and rail presses never target the world.
