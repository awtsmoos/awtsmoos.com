B"H

# Backend Discovery — Room OS Action History

Observed root: `/storage/emulated/0/Documents/git/awtsmoos.com`.

Observed app: `geelooy/apps/tunnel-control`.

Observed backend routes: `geelooy/api/tunnel/control/routes`.

Key evidence:

- `mission-room/stream` exists and emits EventSource snapshots.
- Current snapshot asks the tunnel for `missionProjectStatus` and `missionTimeline`.
- `protectedFs` session-safe actions include mission room actions but not action history actions.
- Native available-action response did not include `actionHistoryList`, despite an existing file `actionGroups/actionHistoryActions.js`.
- `actionLedger.js` exists and records `.awtsmoos/actions/history.jsonl`, result refs, inputs, outputs, parentActionId, createdAt, and replayability.
- `actions.js` does not import or spread `buildActionHistoryActions`; therefore the ledger API file exists but is not wired into the native action registry.

Conclusion:

Step 1 should first wire existing action history infrastructure into the native registry, then allow the dashboard session to call read-only history actions, then enrich `mission-room/stream` with actual action history when available.
