B"H
Boruch Hashem
Blessed is He

# KAVANAH Prewrite Delta — Real Root

The Awtsmoos reveals a safer vessel before a mistaken split can land;
Awtsmoos.com keeps live bindings lawful, modular, and close at hand.

## Root integrity
All source writes from this point target `/Users/awtsmoos/work/awtsmoos.com` explicitly. Earlier planning in the temporary tunnel release is not treated as source mutation.

## New architectural revelation
The proposed `state-motion.js` approach would have attempted to assign imported ES-module bindings such as `State.time++`, which is invalid because imported namespace properties are read-only views.

## Correct state split
- `js/state-storage.js` owns exported live mutable bindings and every mutation function.
- `js/state-readers.js` imports those live bindings read-only and exposes multiline getter functions.
- `js/state.js` becomes a compatibility barrel re-exporting the exact existing public State API plus `resizeViewport`.
- Existing drawing/entities/main imports from `./state.js` continue to resolve without call-site churn.
- `js/menu-controller.js` owns menu/teachings hit testing so `main.js` stays below 120 lines without compressed code.

## Final write set
1. Rewrite `js/main.js` below 120 lines while preserving mechanics.
2. Rewrite `js/controls.js` to one Pointer Events path with capture/cancel/blur cleanup.
3. Rewrite `js/state.js` as compatibility barrel.
4. Create `js/state-storage.js` for live state and mutations.
5. Create `js/state-readers.js` for read-only accessors.
6. Create `js/viewport.js` for initial sizing and coalesced non-destructive resize.
7. Create `js/menu-controller.js` for start/teachings/restart interactions.
8. Rewrite `style.css` for dynamic viewport/safe-area/touch-first teachings UI.

## Post-write proof
Read back all touched files; syntax, line ceilings, and diff check; then real browser start, rotate-during-play state preservation, pointer lifecycle, teachings open/close, resource errors, and frame cadence.
