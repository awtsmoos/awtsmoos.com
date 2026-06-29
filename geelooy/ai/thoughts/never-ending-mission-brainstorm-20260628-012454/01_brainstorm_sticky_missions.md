B"H

# Brainstorm: make the tunnel mission sticky and never naturally ending

## Core revelation

The current mission engine already knows how to say `mustContinue`, but a caller can still ignore it. That means the true missing architecture is not another status field. The missing architecture is a **mission gravity field**: once a mission becomes active, every road bends back into that mission until an explicit, audited finalization gate allows release.

The tunnel should not merely suggest continuation. It should make continuation the natural shape of every response.

## 1. Mission gravity, not mission advice

Every action should pass through a project mission governor. If any mission is active, unrelated actions should become mission events, not normal responses.

Examples:

- `read README.md` while mission active becomes:
  - allowed only if current step permits reading,
  - recorded as mission evidence,
  - response includes next mission step.

- `commandRun npm test` while mission active becomes:
  - allowed only as a mission verification command,
  - linked to current task/step,
  - auto-attached as job evidence.

- `write file.js` while mission active becomes:
  - allowed only after read proof and step plan,
  - recorded as touched artifact,
  - must call review next.

So instead of blocking all unrelated actions, the better system **absorbs** them into the mission when safe, and blocks only when they do not fit the mission step.

## 2. Mission lock should be persistent, not inferred only from status

A mission should have a separate lock record:

```json
{
  "projectRoot": "...",
  "activeMissionId": "...",
  "mode": "exclusive",
  "startedAt": "...",
  "minimumUntil": "...",
  "releaseAllowed": false,
  "owner": "daemon",
  "lastMustCallNext": {...}
}
```

This lock should live in AwtsmoosDB, not be inferred by scanning missions. A mission can accidentally say `status: done`; the lock should still say `releaseAllowed:false` until finalization court passes.

## 3. Done is not release

The mission status field should stop being the authority. Introduce separate concepts:

- `taskStatus`: planned / running / done
- `missionStatus`: active / paused / failed / finalized
- `releaseStatus`: locked / releasable / released

A task can be done. A mission can have done tasks. But release remains locked until one-hour court, queue, evidence, review, and finalization pass.

## 4. Final response must be impossible by default

Every mission response should include:

```json
{
  "finalAnswerAllowed": false,
  "mustContinue": true,
  "mustCallNext": {...},
  "releaseStatus": "locked"
}
```

Only `missionFinalize` can flip that. `missionReport` can never be final. `missionGet` can never be final. Any action without finalization proof defaults back to continuation.

## 5. Daemon-owned continuation

Add a daemon loop that runs inside the agent process:

- reads active mission lock from AWDB,
- calls `mustCallNext`,
- records receipt,
- sleeps briefly if command running or gate needed,
- resumes after restart.

This makes continuation independent of ChatGPT. ChatGPT can observe, steer, or answer gates, but the daemon owns the loop.

## 6. Gates should pause, not end

When multiple-choice gates appear, the daemon should persist:

```json
{
  "blockedOn": "missionAnswer",
  "questionId": "...",
  "recommendedAnswer": "C",
  "autoAnswerAllowed": true|false
}
```

If auto-answer is allowed, it calls `missionAnswer`. If not, it pauses but keeps the lock active. No natural ending.

## 7. Next-8 should be the default mission heartbeat

The mission heartbeat should be:

1. plan next 8
2. execute step 1
3. review step 1
4. execute step 2
5. review step 2
6. ...
7. review step 8
8. repeat better

Every `repeat better` creates another next-8 round until release court passes.

## 8. All normal tools should become mission-aware

Instead of only mission actions understanding mission state:

- read tools produce `missionEvidenceCandidate`
- write tools require active step/chunk authorization
- command tools auto-attach jobs to mission
- grep/search tools count as inspection evidence
- tests count as verification evidence
- action history records missionId linkage

## 9. Mission memory should be AWDB-primary

Everything sticky should persist in AWDB:

- mission lock
- active mission id per root
- current mustCallNext
- next-8 rounds
- tool receipts
- action-to-mission links
- unanswered gates
- daemon heartbeat
- finalization court verdicts

JSON should be legacy import/export only.

## 10. Sticky mission should survive restart

On startup:

1. load project lock from AWDB
2. if `releaseAllowed:false`, resume daemon loop
3. if blocked on gate, expose gate in status
4. if last action was command-running, poll job
5. if stale, call missionRecovery
6. continue next-8 loop

## 11. Mission release must require proof, not elapsed time only

One hour is necessary but not sufficient. Release should require:

- minimum runtime satisfied
- next-8 round completed at least once
- repeat-better round created
- at least one live verification command
- evidence recorded
- active lock release receipt
- finalization court ok

## 12. Response simplification should be hard, not optional

Focused envelope should strip:

- giant `report`
- giant `queue.items`
- entire `selfImprovement` trees
- full room objects
- full next-8 round unless requested

Default response should be under 4 KB.

Large payloads go to AWDB output refs.

## 13. Mission lock modes

Possible modes:

- `exclusive`: block/absorb all unrelated actions
- `observe`: allow actions but record them as mission evidence
- `guided`: only mission actions auto-continue
- `daemon`: daemon keeps loop alive without caller
- `hard`: no action except allowlist unless mission permits it

Default for serious tunnel stress missions should be `exclusive + daemon`.

## 14. Anti-ending invariants

The mission must never naturally end while any of these is true:

- project lock exists and releaseAllowed is false
- minimum runtime not met
- current next-8 round not reviewed
- repeat-better not called after round completion
- queue requiredOpen > 0
- finalization court not passed
- gate unanswered
- command suspended/running
- evidence debt exists
- active lease not expired or can renew

## 15. Supervisor contract

The daemon should have its own action:

- `missionDaemonStart`
- `missionDaemonStatus`
- `missionDaemonStop`
- `missionDaemonTick`
- `missionDaemonRecover`

But `missionDaemonStop` should only pause, not release, unless explicit release court passes.

## 16. Mission-owned action dispatch

`handleFsAction()` should do:

1. normalize payload and params
2. load active project lock
3. if no lock, normal dispatch
4. if lock active:
   - mission action: allow
   - safe tool action fitting current step: allow and attach receipt
   - emergency/status action: allow
   - unrelated action: return focused block with mustCallNext
5. compact mission response
6. update lock.lastMustCallNext
7. enqueue daemon tick if needed

## 17. Why it still ended early before

Because `status: done` was treated as inactive by the guard. That means mission action flow can set done too early, while innovation/finalization still says continue. Fix: active guard must check release lock, not status alone.

## 18. Concrete next implementation ideas

1. Add `missionLockStore` AWDB modules.
2. Set lock on `missionStart`.
3. Update lock on every mission response.
4. Guard based on lock, not mission.status.
5. Introduce `releaseAllowed` only from `missionFinalize` success.
6. Add daemon tick loop actions.
7. Add mission-aware wrappers for read/grep/command/write.
8. Hard-cap focused response size.
9. Add live test proving `read` blocks while lock active even if mission status says done.
10. Add live test proving daemon tick resumes after restart.

## 19. Poetic architecture

The mission is not a note on the wall. It is gravity.
The agent is not allowed to walk out of the room merely because one candle was lit.
The room remains sealed until the Awtsmoos says the work has become a vessel,
until the vessel has been inspected, broken, remade, verified, remembered,
and only then released.
