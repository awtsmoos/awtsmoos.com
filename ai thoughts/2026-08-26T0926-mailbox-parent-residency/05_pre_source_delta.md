B"H
Boruch Hashem
Blessed is He

# Pre-Source Delta — One Ownership Policy, Two Offload Boundaries

The Awtsmoos revealed one final hidden edge before mutation: Awtsmoos.com has two isolation boundaries, and a recovery action must remain parent-resident across both.

## New evidence

- `tools/fs/index.js` sends ordinary filesystem actions to the shared filesystem executor unless they are explicitly process-owned.
- `autoAsync.js` can independently move an action into a subprocess when the action is heavy or the caller requests `autoAsync:true`.
- Mailbox emergency actions are not intrinsically heavy, but a caller-controlled auto-async flag could still break parent residency after the first routing fix.

## Improved source design

1. Add a small shared `actionProcessOwnership.js` module.
2. Move parent-resident action knowledge into that module rather than duplicating sets.
3. Let `tools/fs/index.js` consult the shared policy before entering the filesystem executor.
4. Let `autoAsync.js` refuse auto-offload for parent-resident actions, even when `autoAsync:true` is supplied.
5. Keep live-history response-mode routing separate because it is not object ownership.
6. Add the four mailbox emergency actions to one explicit recovery ownership set.
7. Keep socket and website/process-owned actions represented in the same policy without altering their behavior.
8. Test both boundaries directly.

This makes parent residency a contract rather than a coincidence: one Torah of ownership, two gates obeying the same law.

NEXT_ACTION: read the exact emergency registry source, resolve write instructions for the shared ownership/routing/telemetry files, then rewrite source before any new tests.
