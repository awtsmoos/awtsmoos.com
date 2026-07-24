B"H

Boruch Hashem

Blessed is He

# Phase Two Critique — Twenty Improvements

The Awtsmoos is not contained by the first architecture that appears. Every plan is a finite keli and must be tested against the light it claims to carry. Awtsmoos.com is remembered here while the plan is challenged rather than worshiped.

1. **Do not silently clamp runtime additions.** A full stack should reject excess rather than pretend all requested loot entered the Bag.
2. **Return accepted quantities explicitly.** Transaction receipts must reveal what committed.
3. **Separate restore policy from runtime policy.** Saves may clamp corrupted excess; live operations should reject capacity overflow atomically.
4. **Validate the entries container.** `addMany(null)` and malformed arrays must fail before mutation.
5. **Reject duplicate item IDs inside one live transaction unless deliberately aggregated.** Aggregation should be deterministic before capacity checks.
6. **Protect safe integer arithmetic.** Price multiplied by quantity must remain a safe integer.
7. **Preserve original arrays on every failure.** Tests must assert identity and deep equality where meaningful.
8. **Do not depend on event listeners behaving.** Corpse consumed state must be final before event emission.
9. **Record notification failures without reopening loot.** If the bus throws, keep authoritative state consumed and surface the error as diagnostic evidence.
10. **Use a claim token rather than only a Boolean.** A unique local token prevents unrelated code from releasing another active claim.
11. **Treat existing `actor.looted` as collected.** Backward compatibility must map legacy state into the new claim state.
12. **Do not invent world-space anchor objects per frame.** Root fallback should reparent directly to the bound model.
13. **Prefer exact attachment names.** Normalized matching must never override an exact canonical node.
14. **Detect ambiguous normalized names.** Choose deterministic first traversal order and report ambiguity count.
15. **Preserve canonical launcher assertions.** Canonical models must still report exact `mixamorig:RightHand`, `mixamorig:Spine2`, and `upper-back`.
16. **Keep attachment side additive.** Existing callers need no new argument; default remains right hand.
17. **Do not recreate weapon geometry when only draw state changes.** Test object identity across repeated toggles.
18. **Clear stale Bag selection after any store publication.** Not only drop actions can remove an item; loot/persistence/session code can also change inventory.
19. **Avoid DOM-specific tests in the core pass unless a reliable DOM harness exists.** Protect the controller through source contract and core tests rather than introducing a fake browser dependency.
20. **Test adjacent Torah behavior.** Inventory refactoring must not break learning, pin limits, usage timestamps, or serializable state.

## Additional Risks Revealed

- Listener callbacks may mutate the store during publication. The store should snapshot listener iteration to avoid Set mutation surprises.
- Structured cloning definitions embedded in snapshots must remain supported by the current runtime.
- Equipment derived stats may double-count duplicate slot references; preserve current behavior unless a real contract says otherwise.
- Root fallback transforms differ from bone-local transforms; use a conservative visible transform profile and report fallback quality.
- Weapon attachment code must tolerate an ordinary Three.js-like object as well as the tiny runtime.
- A failed event after loot commit cannot be rolled back safely because inventory listeners may already persist the transaction.

## Improved Direction

- Runtime transactions aggregate duplicate requested entries, validate total capacity, and either commit all or none.
- Restore transactions aggregate and clamp corrupted data without throwing.
- Corpse claim rules expose a token and explicit state transitions.
- Equipment resolution returns node plus quality and alias evidence.
- Diagnostics distinguish desired attachment from actual attachment.
- Tests assert publication counts, object identity, state identity on failure, and canonical launcher-compatible fields.
