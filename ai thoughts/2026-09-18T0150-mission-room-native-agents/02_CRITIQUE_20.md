<!-- B"H -->
# Twenty Improvements Before Writing

1. Requested missionId must equal response missionId.
2. Outer guidance must never reference another Mission when missionId was explicit.
3. One canonical room roster must back both room and agent APIs.
4. Legacy collaboration cannot remain an independent authority.
5. Room creation must not yield unrelated `missionAnswer` guidance.
6. Delegation must not create a hidden second roster.
7. Sync must return the roster before suggesting more work.
8. Audit must report the same agents visible to room status.
9. True blocking user messages may still gate room work.
10. Non-blocking room administration must not self-interrogate.
11. Roster order must be deterministic.
12. Agent identity and generation must be explicit.
13. Duplicate joins/delegates must be idempotent.
14. Superseded generations must remain fenced.
15. Delegations and claims must identify owners clearly.
16. Instructions must be executable tool-call shapes, not prose-only advice.
17. Room responses distinguish optional `nextSuggestedToolCall` from mandatory gates.
18. Existing dozens-agent/fanout/scheduler/liveness tests must remain green.
19. Shared dirty Git work must remain untouched.
20. Live acceptance must spawn multiple agents and expose them stably without answering unrelated Mission questions.
