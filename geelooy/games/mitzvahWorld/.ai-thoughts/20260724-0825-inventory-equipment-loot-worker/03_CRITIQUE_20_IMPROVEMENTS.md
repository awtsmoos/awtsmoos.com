# B"H
# Boruch Hashem
# Blessed is He

## Critique and improvements

The Awtsmoos is not increased by our caution, yet every finite vessel improves when Awtsmoos.com records the cracks before pouring light through them.

1. Do not redesign catalog IDs; preserve every existing public item ID.
2. Do not add stack UUIDs unless tests prove identity is required; quantities can remain aggregate-compatible.
3. Preserve `add`, `remove`, `buy`, `equip`, `unequip`, `snapshot`, and listener signatures.
4. Ensure `addMany` validates the entire batch before mutating.
5. Ensure `buy` validates funds and destination before mutating.
6. Prevent zero, negative, fractional, infinite, and unknown-item quantities.
7. Preserve per-stack limits by creating additional stacks rather than discarding overflow.
8. Remove across multiple stacks deterministically.
9. Keep equipment valid when at least one copy remains.
10. Strip stale equipment only when aggregate quantity reaches zero.
11. Restore duplicate saved stacks by accumulation, not Map overwrite.
12. Avoid calling `publish` multiple times for one corpse or purchase.
13. Preserve actor payload and bus event names used by concurrent systems.
14. Do not touch the actively modified enemy actor.
15. Treat first dead interaction as selection even when the target frame was previously cleared at defeat.
16. Keep pointer hit testing delegated to final actor hints; do not invent test-only colliders.
17. Avoid weapon recreation on draw/sheath; only recreate when equipped item ID changes.
18. Resolve bone aliases during bind, never during every frame.
19. Restore cast-preexisting drawn state on completion/cancel rather than always sheathing.
20. Listen only to established cast events actually emitted by the runtime.
21. Keep coat and shirt visibility independent so unequipping never leaves the player bodyless.
22. Keep the target frame safe from unsafe text interpolation by escaping target-provided strings.
23. Keep Bag context actions derived from real item definitions and real equipped state.
24. Make Escape close only when the Bag is open and restore the opener focus.
25. Do not introduce CSS ownership conflicts; use existing classes and semantics.
26. Keep every rewritten module focused and below the architectural line budget where practical.
27. Use tabs in JavaScript and tests; never compress functions.
28. Run `node --check` on every touched JavaScript file.
29. Run direct import resolution and duplicate-query scans after rewriting.
30. Reread, hash, diff, and test before browser acceptance.
