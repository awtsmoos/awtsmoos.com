# B"H — Forgiving API + Hard Question Gate + Chat Room Brainstorm

## Evidence from real files
- `protectedFs.js` is the central hosted action route and now normalizes carriers through `normalizeCarriers()` before vessel dispatch.
- `tunnelPayload.js` is the earlier payload-shaping layer. It should remain simple, while `protectedFs.normalizeCarriers()` becomes the compatibility sponge.
- `protocolGateStore.js` currently arms a forced multiple-choice gate in memory by `logicalAgentId || agentSessionId || clientRequestId || anonymous`.
- `actionGuidance.js` currently returns a compact response focus and only one required choice: `B - continue with proof` while work remains.
- `responsePruner.js` prunes noisy fields unless `guidanceDebug=true`.
- `commandActions.js` owns async command start/status/wait/output-page behavior in the native tunnel agent.
- `batchAliasActions.js` maps `commandBatch` and `aiCommandBatch` into `actionBatch`.
- `mission/collaboration.js` already contains agents, messages, user messages, delegations, claims, heartbeats, audits, invites, and settings.
- `missionRooms/controller.js` auto-discovers, rejoins, heartbeats, refreshes, and sends user messages.
- `generate-tunnel-openapi-live.cjs` now emits compact YAML and includes `multipleChoiceAnswer`, `choice`, and `answer`.

## Problem: old GPTs and old schemas break on async job polling
Old agents may send `jobId` directly, or inside `params`, or via `waitPayload`, `statusPayload`, `stdoutPagePayload`, or `taskId`. The forgiving layer should accept all of them.

## Forgiving async normalization design
Add `core/asyncPayloadNormalizer.js` and call it from `protectedFs.normalizeCarriers()` after all carrier parsing.

For `commandWait`, `commandStatus`, `commandJobOutputPage`, `commandOutputPage`, accept job id from:
- `jobId`
- `id`
- `job`
- `taskId`
- `params.jobId`
- `params.id`
- `waitPayload.jobId`
- `statusPayload.jobId`
- `stdoutPagePayload.jobId`
- `stderrPagePayload.jobId`
- `nextPagePayload.jobId`
- nested JSON strings in any of those fields

For stream:
- default `stdout`
- accept `stream`, `stdout`, `stderr`, `logStream`
- if using `stderrPagePayload`, infer `stderr`

For page:
- accept `offsetChars`, `offset`, `cursor`, `start`, `from`
- accept `maxChars`, `limit`, `pageChars`, `maxText`

Return helpful errors if no job id:
- `missing_job_id`
- include `acceptedJobIdFields`
- include example direct and params-shaped calls

## Forgiving batch/action compatibility
- Keep `commandBatch` alias.
- Normalize `commands` / `commands64` into actionBatch steps of `{ action:'command', command }` if array/string supplied.
- Normalize `actionsJson` into `steps/actions` for all batch actions, already partly done.
- Normalize old `bulk` with action-looking rows into `actionBatch`, already partly done.
- Add test that `commandBatch` with `commands64` runs dry-run/validate mode.

## Harder multiple-choice enforcement
Current gate only blocks after a response arms it, but agents can dodge by changing logicalAgentId or session. Improvements:
1. Persist gates per conversation id and tunnel name, not only memory per logical agent.
2. Also bind gate to `conversationId`, `conversationName`, and `requestedTunnelName`.
3. If an agent omits IDs, use conversation+tunnel fallback rather than `anonymous` alone.
4. Allow only these actions while gate pending:
   - `finishAndContinue`
   - `missionAgentRespond`
   - `missionRoomUserMessage`
   - `commandJobOutputPage` / `commandStatus` / `commandWait` for same job inspection
   - an action with `multipleChoiceAnswer|choice|answer` starting `A|B|C|D`
5. Block everything else with:
   `BEFORE YOU GO ON FIRST ANSWER THIS MULTIPLE CHOICE: B - CONTINUE WITH PROOF.`
6. If the agent answers with prose but no leading A/B/C/D, keep blocking.
7. If answer is C/D, require blocker proof fields.
8. If answer is A, require `finalVerification=true` or evidence fields.

## Response cleanup design
- Default response should include only:
  - `ok`, `error`, `action`, `jobId`, `status`, `content`, `responseFocus`, `multipleChoiceSelfInterrogation`, `allCapsPrompt`, `mustCallNext`, `finalAnswerAllowed`
- Include correlation ids only in diagnostics/debug or mismatch responses.
- Include `statusPayload`, `waitPayload`, `stdoutPagePayload`, `stderrPagePayload` for async command starts because that is operationally necessary.
- Remove `peruta`, `routePreference`, giant `aiGuidance`, and long blockers unless `guidanceDebug=true`.

## Chat room / mission room upgrades
1. Room grid should show all rooms automatically — already started in app.
2. Add `Agent Obedience Monitor` page/card:
   - agents with pending gates
   - agents missing room join
   - stale heartbeat
   - open claims
   - conflicting claims
   - last ignored action
3. Add room event stream:
   - `gate_armed`
   - `gate_answered`
   - `action_blocked_by_gate`
   - `claim_conflict`
   - `heartbeat_stale`
4. Add room leadership:
   - oldest live agent or explicit owner is leader
   - transfer if heartbeat stale
5. Add “required next action” in room status so all agents see same command.
6. Persist room gate state in mission collaboration store, not just hosted API memory.
7. Add per-room invitations and tags visible on cards.
8. Add `roomHealth` metrics: active agents, stale agents, open claims, open user messages, pending gates, last event age.

## Concrete next implementation slices
### Slice A — Async compatibility sponge
Files:
- add `geelooy/api/tunnel/control/core/asyncPayloadNormalizer.js`
- rewrite `protectedFs.js` to call it inside `normalizeCarriers()`
- update compact OpenAPI params if needed
Tests:
- direct module test for jobId from `params`, `waitPayload`, `statusPayload`, `stdoutPagePayload`, `taskId`, `id`

### Slice B — Gate persistence and strict allowed actions
Files:
- rewrite `protocolGateStore.js`
- optionally add `protocolGatePolicy.js`
- update `protectedFs.js` enforcement call to pass action context
Tests:
- write/list blocked while gate pending
- answer `B - proof` clears gate
- non-leading prose stays blocked
- commandJobOutputPage allowed if it carries same job id

### Slice C — Room visibility and obedience monitor
Files:
- add API action(s) in mission collaboration or hosted room status
- add Tunnel Control card/page for `Agent Obedience`
- add room metrics rendering
Tests:
- missionRooms render shows room cards and metrics
- obedience monitor render with fake agents/gates

### Slice D — Live reload and stress
- restart hosted API/tunnel agent
- run 20 concurrent marked read/status/job page calls
- verify no misrouted write response accepted
- verify old and new async API shapes both work
