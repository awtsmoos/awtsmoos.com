<!-- B"H -->
# Reality and File Map

## Canonical room stack
- `mission/roomEngine.js`
- `mission/roomAgents.js`
- `mission/roomDelegation.js`
- `mission/roomState/*`
- `mission/roomRuntime/*`
- room scheduler/inbox/watchdog modules

## Legacy collaboration stack
- `mission/collaboration.js`
- directly used by `missionAgentSync/Message/Respond/Delegate/Claim/Heartbeat/Audit/Complete`.

## Response seam
- `actionGroups/missionActions.js` wraps nearly every action in `withNext()`.
- `withNext()` injects generic `M.nextStep(...)` and `M.report(m)` even when a room action already has room-local next semantics.
- A higher Mission-aware response wrapper can then promote that generic Mission gate over the requested room action.

## Live reproduction
- Requested/created Mission: `mission_mu6aujbs_f43eac690e`.
- Initial outer advisory referred instead to `mission_mu6au4jg_1490b8a421`.
- Room create on the correct Mission succeeded but outer next became `missionAnswer` question `q_mu6auxnw_f6488209d8` rather than a room operation.

## Mutation boundary
Prefer small modules and narrow full-file rewrites:
- room-native response/presentation module;
- room/legacy compatibility bridge;
- action wiring for room/agent actions;
- outer Mission-envelope selector only if explicit missionId is still lost after the action response is corrected;
- focused tests for Mission identity and roster stability.
