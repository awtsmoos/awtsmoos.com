# B"H — Open Brainstorm: Relaxing Agent Continuity

## Guiding experience

The front end should feel calm, spacious, trustworthy, and alive. An operator should be able to understand every agent at a glance, gently steer it, define how long it may continue, and know that stopping, pausing, or disconnecting leaves no timer, promise, worker, socket, lease, or mission mutation behind.

## Feature universe

1. A living agent garden where every active agent appears as a truthful card with mission, directory, health, current action, elapsed turn, next action, and human-gate state.
2. Per-agent Pause after current action, Pause immediately, Continue, Stop safely, Cancel forcefully, and Archive controls.
3. Turn budgets by count, elapsed minutes, wall-clock deadline, token estimate, completed tasks, file mutations, command count, and browser actions.
4. Continuation modes: one turn, until gate, until task complete, until review-ready, until deadline, until budget, continuous supervised, and brainstorm-only.
5. Calm presets: Gentle, Focused, Deep Work, Overnight, Review Only, and Human Approval Required.
6. A global master control for pause all, resume selected, drain all, stop all, and emergency cleanup.
7. Per-agent autonomy sliders that map to explicit policies rather than vague labels.
8. A queue editor where the user can reorder mission tasks, pin a task, skip a task, or insert a human request between actions.
9. A turn timeline showing action start, action finish, wait, retry, human intervention, failure, recovery, and resource cleanup.
10. A resource ledger for timers, workers, processes, command jobs, browser targets, WebSockets, EventSources, pending HTTP requests, mission locks, and database handles.
11. Leak alarms that identify ownership and offer one-click cleanup.
12. Backpressure indicators showing queue depth, average turn duration, oldest pending request, and active resource caps.
13. Per-directory agent grouping so agents working in related roots discover one another and can form a room.
14. Cross-room invitations with explicit permissions and file-claim negotiation.
15. A quiet mode that reduces animation and notifications while keeping critical human gates visible.
16. A focus mode that expands one agent while compressing the rest into a side rail.
17. A mobile bottom sheet for agent controls with large touch targets and safe destructive-action confirmation.
18. A review lane where completed agent output waits for human approval without blocking unrelated agents.
19. Automatic continuation prompts generated from durable mission state, never from UI-only memory.
20. A watchdog that distinguishes thinking, waiting, blocked, disconnected, orphaned, and leaked states.
21. A recovery wizard that can reconnect a tunnel, resume a mission, reacquire a browser target, reconcile a ghost command job, and verify file hashes.
22. Per-agent output cadence controls: silent, concise milestones, normal updates, verbose trace, or only human gates.
23. A clean-room test launcher that starts isolated agents with separate temp roots, browser scopes, ports, and command stores.
24. A chaos test panel that injects delayed replies, crossed responses, worker exits, network disconnects, duplicate retries, and browser lease conflicts.
25. Exportable mission receipts containing plan, actions, files, tests, remaining work, and resource-cleanup proof.
26. A session handoff package so another AI conversation can join without reading every historical message.
27. A live collaboration map showing agents, rooms, roots, files, browser targets, and command jobs as a graph.
28. A directory heatmap showing where concurrent agents may collide.
29. A safe file-claim system with read, propose, write, and exclusive-write modes.
30. A completion gate that requires tests, cleanup, no pending resources, and explicit remaining-work disclosure before final answer.

## Visual language

Use deep atmospheric backgrounds, generous spacing, soft glass, warm green for healthy continuation, gold for human-needed, violet for planning, cyan for connected transport, and red only for destructive or leaked states. Motion should be slow and optional. Every state must also be expressed in text and iconography.
