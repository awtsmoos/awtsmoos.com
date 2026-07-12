# B"H — Final Improvement Pass

## Thirty final refinements

1. Store policy schema version.
2. Preserve unknown future policy fields during round trips.
3. Clamp all numeric inputs.
4. Use absolute deadlines in persistence and human-readable durations in UI.
5. Track turns started and turns completed separately.
6. Track consecutive errors separately from total errors.
7. Reset consecutive errors after success.
8. Define whether human-blocked time counts against deadline.
9. Allow deadline extension without resetting counters.
10. Allow one-turn Continue even while globally paused.
11. Add pause reason and stop reason.
12. Add actor identity to control changes.
13. Add updated-at and revision fields.
14. Reject stale revision writes.
15. Return the authoritative policy after every mutation.
16. Keep scheduler timers unreferenced but keep user-facing waiters referenced.
17. Ensure stop clears future timers.
18. Ensure drain does not begin a new tick.
19. Ensure pause-after-action finishes only the current action.
20. Ensure repeated start does not create duplicate timers.
21. Ensure repeated stop is harmless.
22. Ensure resource snapshot omits secrets and raw handles.
23. Show policy conflicts clearly in the frontend.
24. Disable impossible controls based on observed state.
25. Keep destructive controls visually separate.
26. Make presets visible as exact resulting limits.
27. Add mobile sticky controls for the selected agent.
28. Add calm animations only for transitions, never continuous distracting motion.
29. Test 1,000 start-stop cycles with a fake scheduler loop where feasible.
30. Record any unverified runtime behavior rather than claiming a guarantee.

## Final scope for this pass

Implement the durable continuation policy and a polished frontend control surface around the existing Mission Rooms and daemon. Add resource evidence and repeated lifecycle tests. Do not attempt an unrelated full rewrite of every pane.
