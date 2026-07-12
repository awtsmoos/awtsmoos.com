# B"H — Improvement Review

## Twenty improvements over the open brainstorm

1. Separate user-facing autonomy language from exact backend policy fields.
2. Never rely on frontend timers as authoritative continuation state.
3. Make pause semantics explicit: immediate, after action, after turn, and after checkpoint.
4. Make stop semantics explicit: drain resources, cancel active work, or archive only.
5. Attribute every resource to an owner, mission, room, agent session, and creation action.
6. Require idempotency keys for every control mutation.
7. Persist budgets and pause state with the mission rather than in memory only.
8. Add monotonic sequence numbers to avoid stale frontend controls overwriting newer state.
9. Treat disconnection as a recoverable state, not immediate failure.
10. Add exponential backoff with upper bounds and jitter for reconnect and retry.
11. Distinguish desired state from observed state.
12. Show when an agent is draining rather than simply labeling it paused.
13. Add a global concurrency cap and per-root cap.
14. Add automatic stale-resource reconciliation on startup and periodically.
15. Make cleanup proof part of completion receipts.
16. Add a dry-run preview for destructive multi-agent controls.
17. Add keyboard shortcuts with accessible descriptions.
18. Add responsive controls without hiding essential safety actions behind hover.
19. Add deterministic tests with fake clocks rather than long real timers.
20. Add chaos tests that verify no registry growth after repeated start-stop cycles.

## Revised architecture

The best near-term architecture is a durable continuation policy attached to each mission, exposed through a small set of explicit control actions. The scheduler reads this policy before and after each tick. The frontend renders desired and observed state, sends idempotent mutations, and shows resource evidence. A small resource ledger tracks owned timers and runtime artifacts where practical, while focused reconciliation functions handle stores that already exist.
