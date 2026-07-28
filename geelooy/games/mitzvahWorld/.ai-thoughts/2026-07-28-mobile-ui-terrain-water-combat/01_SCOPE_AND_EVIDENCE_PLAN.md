B"H

# Scope and Evidence Plan

## Visible failures from the supplied screenshots

- Cast meter extends beyond the left viewport edge.
- Target frame is clipped horizontally in portrait orientation.
- Bag overlay cannot reliably scroll or receive item presses.
- Quest completion parchment lacks a richer completion/turn-in sequence.
- Quest menu does not consistently reflect the active mission lifecycle.
- Ground presents one dominant grass image with no convincing dirt or road composition.
- Trees expose flat or vegetable-like foliage identities.
- Water lacks convincing texture, normal motion, depth, and readable shoreline presence.
- Attack feedback does not clearly show damage amount or action identity.
- Corpse selection requires an overly precise tap.

## Inspection obligations

1. Trace every runtime and stylesheet owner from current files.
2. Compare the current implementation with commits from July 22 through July 24.
3. Preserve all verified fixes already present in the uncommitted working tree.
4. Rewrite complete files only.
5. Keep each source and test module at or below 120 lines.
6. Finish production code before running tests.

## Verification obligations

- Focused unit contracts for every repaired subsystem.
- Mobile portrait browser measurements.
- Real pointer interaction for Bag and corpse selection.
- Live material evidence for terrain, trees, and water.
- No console errors, JavaScript exceptions, HTTP errors, or failed settled requests.
