B"H

# Level One Glitch Tikkun Plan

## The visible wound

The screenshots show level one booting, then breaking with repeated worker fatality messages:

- `TypeError: Cannot read properties of undefined (reading 'dispose')`
- stack: `ckidsAwtsmoos/Olam/eventListeners/destroy.js:19:40`
- `ReferenceError: document is not defined` from `FallResetTrigger.makeLetterParticle`
- render worker reports exiled vanity and entity loop failure.
- world geometry floats: moc/road/platform-like creations are not settled onto the ground.
- visual target should move away from harsh lava/debug chaos and toward the reference village: warm sunset, grass, stone house, tree, lamps, path, garden feeling.

## Constraints

- Inspect real files before editing.
- Never partial patch.
- Rewrite every modified file fully.
- Keep every written file small and complete.
- Prefer static client-side fixes under `geelooy/games/mitzvahWorld`.
- Test with node syntax checks and runtime-oriented probes where possible.

## Immediate trace steps

1. Read `ckidsAwtsmoos/Olam/eventListeners/destroy.js` to fix undefined disposer access.
2. Search `FallResetTrigger` and read its file to remove DOM usage from worker code.
3. Search level-one definitions and floating platform/road/moc builders.
4. Read terrain/ground alignment helpers already present, especially `PhysicalAlignment.js`, `GroundRectifier.js`, and level data.
5. Rewrite full responsible files only, possibly adding tiny helper modules if needed.
6. Run `node --check` on changed JS files.
7. Run import/static graph checks already in AI_THOUGHTS if useful.

## Expected fix shape

- Destroy routine should treat missing dispose as harmless, recursively dispose only where real dispose exists, and never throw inside cleanup.
- Worker-side particle logic must not touch `document`; use THREE/native geometry/material generation or plain descriptors.
- Entity ground settling should use a single data-based helper that reads bounding boxes, finds support height, and lowers/raises creations to terrain top.
- Level 1 visual config should use grass terrain, path, trees, warm light, stone/wood materials, and reduce lava dominance.

## Chapter 2 seed

The Awtsmoos reveals the bug as a false gate: a cleanup sword swung at an undefined shadow, and a worker asked for a document in a realm where no window had ever been born.
