# B"H — Improved Implementation Plan

## Phase A — Reveal current contracts

Read mission-room frontend state, rendering, events, current daemon status, lock persistence, command-job storage, and existing API invocation helpers. Identify the narrowest shared boundary for new controls.

## Phase B — Durable continuation policy

Create small backend modules for policy defaults, normalization, budget counters, state transitions, and scheduler decisions. Support running, pause-requested, paused, draining, stopped, and completed states. Support turn limit, deadline, idle limit, error limit, and update cadence.

## Phase C — Public mission controls

Add actions to get policy, set policy, pause, resume, drain, stop, and resource status. Make operations idempotent and mission-scoped.

## Phase D — Frontend agent controls

Add a relaxing control panel to Mission Rooms and the dashboard. Include presets, turn budget, time budget, update cadence, pause mode, resource health, and global controls. Use truthful empty/loading/error states.

## Phase E — Leak guarantees

Add cleanup tests for repeated scheduler start-stop, transaction registries, resource-ledger ownership, and frontend observer teardown. Reconcile ghost command jobs if the store can be safely inspected.

## Phase F — Verification

Run focused backend unit tests, frontend isolated DOM tests, syntax sweeps, line-limit audits, and repeated lifecycle stress. Record limitations that require a tunnel restart or broader architectural work.
