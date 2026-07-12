# B"H — Implementation Delta

## Original request

Create a more relaxing and beautiful frontend, brainstorm many additional features, provide deeper turn controls, keep long-running AI work moving, and prove that pause, stop, retries, timers, and concurrent agents do not leak resources or cross identities.

## What was actually implemented

### Durable mission turn policy

A versioned continuation policy is now stored with each mission. It includes:

- Desired state: running, paused, draining, or stopped.
- Observed state: idle, running, paused, budget-paused, drained, or stopped.
- Human policy revision separated from runtime accounting revision.
- Turn budget.
- Runtime-minute budget and optional absolute deadline.
- Consecutive-error budget.
- Scheduler interval and paused polling interval.
- Update cadence.
- One-turn credits.
- Started/completed turn counters and error counters.
- Actor, reason, policy-update, runtime-update, and gate evidence.

Unknown future fields survive normalization, while all safety numbers are clamped. Human writes may include an expected policy revision and receive an explicit conflict instead of silently overwriting newer state. Runtime counters do not invalidate the human policy revision.

### Explicit control actions

The continuation action family now exposes:

- `missionTurnStatus`
- `missionTurnSet`
- `missionTurnPause`
- `missionTurnResume`
- `missionTurnDrain`
- `missionTurnStop`
- `missionTurnOnce`
- `missionResourceStatus`

Human controls are assigned to the P0 control lane so they stay responsive behind heavy work. Status actions bypass mission mutation serialization; all mutating controls serialize by mission.

### Per-mission scheduler isolation

The scheduler registry is keyed by project, metadata root, and mission ID. Two missions in the same repository receive different scheduler state, timers, counters, and cleanup paths. Start is idempotent. Stop clears the timer and removes the registry entry immediately when idle or after the active turn completes.

A paused mission intentionally retains at most one bounded polling timer so Resume or One Turn remains available. Stop and Clean is the zero-resource state. Drain finishes the current serialized action, starts no new mission action, and then removes the scheduler lane.

### Relaxing Mission Rooms frontend

A new atmospheric control surface appears between the Mission Rooms lobby and room workspace. It provides:

- Gentle, Focused, Deep Work, Overnight, and Review Only presets.
- Editable turn, runtime, error, and interval limits.
- Update cadence.
- Safe pause boundary.
- Pause, Resume, Run One Turn, Drain, Stop and Clean, Save Limits, and Refresh Evidence.
- Desired and observed state.
- Policy revision.
- Turn-budget progress.
- Mission timer and in-flight state.
- Global scheduler entry/timer counts.
- Transaction-key count.
- Clear lifecycle explanation for Drain versus Stop.

The panel is intentionally labeled Mission Turn Control. The current daemon owns one shared continuation lane for the selected mission; it does not falsely claim independent next-action queues for every room member.

### Frontend lifecycle cleanup

Mission Rooms now uses one module-level controller, one abortable listener set, and revisioned pane activation. Repeated mounts reuse the same controller. Opening the pane starts discovery and selected-room streams. Leaving the pane or returning Home closes WebSocket/EventSource resources and clears discovery, room polling, and replay timers.

If discovery completes after the user has already left, its stale promise cannot reopen a socket or recreate a timer.

### Responsive visual system

Agent-turn styling is split into layout, policy, resource, and responsive modules. It includes calm glass surfaces, state-colored borders, horizontal mobile presets, single-column mobile controls, touch-sized buttons, reduced-motion behavior, explicit destructive-action grouping, and no hover-only safety controls.

## Brainstorm catalog retained for future passes

The initial planning ledger contains more than thirty additional concepts, including fleet controls, individual-agent queues, resource ownership ledgers, chaos injection, directory heatmaps, file claims, review lanes, handoff packages, global backpressure, recovery wizards, and completion receipts. These were intentionally not all collapsed into one unverified implementation pass.
