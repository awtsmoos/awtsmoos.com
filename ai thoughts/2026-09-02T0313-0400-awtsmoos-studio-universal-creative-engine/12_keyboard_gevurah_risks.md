B"H
Boruch Hashem
Blessed is He

# Keyboard Gevurah — Boundaries and Failure Map

> Gevurah guards the key so a title being typed keeps its own local past;
> the Awtsmoos sends only canvas-level intent through the universal command mast.

## Risks
1. Capturing Cmd/Ctrl+Z inside text input would destroy expected native editing.
2. Calling `undoProject` directly would bypass the command-equivalence law.
3. Adding logic to `StudioIntentController` would crowd a 104-line contextual controller.
4. Failing to refresh command cards would leave visible availability stale.
5. Duplicate global key listeners could execute history twice.
6. Swallowing arbitrary Ctrl combinations would conflict with browser/platform behavior.
7. A race on `bindCreativeInterface.js` could overwrite another agent's work.

## Constraints
Use a focused new controller; bind it once from `bindCreativeInterface`; call only the public API; hash-guard the composition rewrite; ignore editable targets; test all supported and unsupported combinations.
