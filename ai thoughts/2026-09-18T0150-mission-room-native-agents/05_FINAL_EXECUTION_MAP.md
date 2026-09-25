<!-- B"H -->
# Final Execution Map

## Read before mutation
- outer Mission-aware response adapter producing `mission`, `detailsRef`, `nextSuggestedToolCall`, `resumeAvailable`.
- complete room/agent section of `actionGroups/missionActions.js`.
- `roomState/base.js`, `roomState/status.js`, `roomAgents.js`, `roomDelegation.js`.
- legacy `collaboration.js` response/status plus existing compatibility tests.

## Intended implementation
1. Add a small room-native response module (<120 lines) that exposes:
   - missionId and roomId;
   - stable sorted `agentRoster`;
   - room counts/health;
   - clear executable `instructions` for spawn/join/delegate/sync/inbox/audit/status;
   - room-local `nextSuggestedToolCall`;
   - mandatory gate only when room state itself is blocking.
2. Add a small compatibility bridge if needed so legacy `missionAgent*` operations always ensure/update the canonical room roster and then project legacy fields.
3. Rewrite only the narrow action-wiring module(s) required to use that contract.
4. Fix outer response selection so explicit action missionId wins over unrelated session Mission state.

## Verification
- baseline room/gate/legacy tests before write;
- focused wrong-Mission-envelope regression;
- stable roster across create/join/delegate/sync/audit/reload;
- duplicate/concurrent delegate idempotency;
- dozens-agent/fanout/liveness/routing/scheduler/forced-gate suites;
- syntax, line counts, `git diff --check`;
- live disposable room with coordinator + agent-a + agent-b, same roster from room status and agent audit, no unrelated `missionAnswer`.
