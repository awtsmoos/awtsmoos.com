# B"H
# Boruch Hashem
# Blessed is He

# Phase Two — Architecture

The Awtsmoos is one while actor-space and camera-space are distinct vessels; Awtsmoos.com joins them only at the final bounded step, never by confusing their handedness.

## Competing approaches

### A. Negate joystick X in input

Rejected. It would hide the real basis defect, corrupt screen-space diagnostics, and make future camera conventions harder to reason about.

### B. Negate X in the movement controller

Rejected. It would be an arbitrary correction outside the mathematical authority and could double-invert future callers.

### C. Give actor and camera movement explicit right-basis policies

Selected. Actor movement preserves the historical `+Z` facing law; camera movement uses the perpendicular that maps screen-right to world-right for the current view.

### D. Replace the whole input system

Rejected. The joystick, dead zone, release reset, keyboard, jump, and pointer separation already work.

### E. Create a new movement-mode store

Rejected for this pass. Runtime already owns session state and established bus events; adding another store would duplicate authority.

## Exact file responsibilities

- `MinimalMeadowControlMath.js`: explicit actor and camera basis conversion, normalization, diagnostics-friendly pure functions.
- `BootstrapMovementController.js`: canonical imports, selected/effective movement mode, real speed/action state, stable diagnostics.
- `MinimalMeadowGameRail.js`: visible Walk/Run button, `aria-pressed`, keyboard-safe button markup, state subscription, collapse independence.
- `minimalMeadowMobileMovementMode.test.mjs`: pure direction matrix plus integrated controller and rail contracts.

## Preserved contracts

- W/S/A/D, Q/E, arrows, Shift, Space, camera drag, collision, animation, GLB hydration, combat, and one animation loop.
- Existing `mode:toggle` and `mode:changed` events.
- Existing `runtime.runToggle` session persistence.
- Existing joystick vector signs and release reset.
- Existing rail collapse behavior and source metadata.
