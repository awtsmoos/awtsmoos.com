<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Twenty Handoff Corrections

1. Reuse live shared Chrome authority before reading stale registry state.
2. Never create a second physical Chrome profile.
3. Recover the canonical shared profile only when live authority is absent.
4. Never copy cookies or session secrets.
5. Preserve exact CDP target ownership.
6. Keep successor prompt persistence proof mandatory.
7. Keep exact target closure proof mandatory.
8. Do not infer Mission completion from chat closure.
9. Let completion debt alone decide whether successor dispatch occurs.
10. Preserve continuation lease fencing.
11. Preserve continuation fingerprint/idempotency.
12. Preserve predecessor/session terminal event exactly once.
13. Preserve zero-debt stop behavior.
14. Keep registry override for deterministic tests.
15. Reject invalid live ports rather than guessing.
16. Report whether browser authority was live or recovered.
17. Do not close arbitrary existing user tabs.
18. Do not select tabs by title/position.
19. Test live-authority preference and shared-profile recovery separately.
20. Verify the full terminal-chat → continuation → shared-browser transport chain.
