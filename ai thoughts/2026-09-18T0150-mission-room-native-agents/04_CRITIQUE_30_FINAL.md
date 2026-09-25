<!-- B"H -->
# Thirty Final Checks

1. Requested missionId equals response missionId.
2. Outer Mission guidance never references another Mission.
3. Room create returns roomId immediately.
4. Room create returns roster immediately.
5. Explicit coordinator join appears in roster.
6. Agent delegate targets canonical room identity.
7. Agent sync sees room-created agents.
8. Agent audit sees room-created agents.
9. Room status sees agent-delegated agents.
10. Legacy collaboration callers retain compatible fields.
11. No second independent roster is silently created.
12. Stable sorting prevents roster jitter.
13. Agent generation is visible.
14. Superseded generation stays fenced.
15. Heartbeat freshness is visible.
16. Claims and delegations are visible per agent.
17. Blocking room user interrupt remains a true gate.
18. Non-blocking room action has no self-interrogation gate.
19. `nextSuggestedToolCall` is room-native.
20. Mandatory next exists only for a true blocking invariant.
21. Room actions work without prior protocol Q&A.
22. Room actions do not mutate unrelated Mission questions.
23. Core Mission planning actions keep their gates.
24. Dozens-agent test remains bounded and deterministic.
25. Fanout/restart/scheduler persistence remains green.
26. Concurrent delegates do not duplicate identities.
27. Reload preserves roster and ownership.
28. Shared dirty work remains byte-identical.
29. Explicit-path commit only.
30. Live instructions clearly show how to spawn, inspect, message, claim, sync, audit, and stop agents.
