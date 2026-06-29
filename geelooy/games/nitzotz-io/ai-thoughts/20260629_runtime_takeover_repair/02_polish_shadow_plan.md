B'H

# Polish Pass: Selective Shadow Breath

## Evidence
The verified browser path is healthy, but the smoke test still reports high-mode command counts above the earlier target. The render-list read showed `objectCommands` emits a shadow for every visible object whenever quality is above 0.48. That doubles much of the object draw burden.

## Safe target
Rewrite `games/nitzotz-io/js/renderList/objects.js` as a whole file. Keep module size small. Preserve all public imports and exports. Change only shadow policy so common objects do not always receive a second draw command.

## Intended behavior
- Rare/landmark objects keep shadows at healthy quality.
- Small edible/local objects keep shadows to maintain readability.
- Ordinary background clutter loses shadow commands first.
- Absorbing objects can keep more shadow identity while animating.

## Verification
1. Rerun `node games/nitzotz-io/test/smoke.mjs`.
2. Rerun procedural test and WebGL import if needed.
3. Rerun browser CDP smoke after change.
4. Compare command counts and ensure no bad resource loads.
