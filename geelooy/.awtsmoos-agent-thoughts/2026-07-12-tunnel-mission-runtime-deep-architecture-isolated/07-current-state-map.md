# B"H — Current-State Architecture Map

## Evidence boundary

This map is based on direct source reads and direct runtime observations made through the still-running tunnel. No production process was restarted or replaced.

## Request lifecycle

```text
Tunnel Control / API caller
	-> HTTP relay route
	-> tunnelRelay.sendTunnelRequest
	-> in-memory pendingTunnelRequests Map
	-> one registered socket selected by tunnelName
	-> TUNNEL_REQUEST envelope
	-> agent action dispatcher and priority lane
	-> action group / worker / browser / mission subsystem
	-> TUNNEL_RESPONSE envelope
	-> relay validation against expected identity
	-> completedTunnelRequests Map or quarantine array
	-> one or more HTTP waiters
```

### Observed strengths

- Same control request ID and same expected identity can coalesce multiple waiters.
- A mismatched response is intended to be quarantined rather than resolving the pending request.
- Completed responses are retained briefly for late retry.
- Relay and agent carry many explicit correlation fields.
- P0 control work has reserved queue admission.

### Observed weaknesses

- Pending, completed, and quarantined state is process-local memory.
- Request expiration and waiter expiration are timer-owned without a resource ledger.
- Registration replaces the old socket but does not issue and enforce a durable `connectionEpoch`.
- Stream sequence, replay acknowledgment, missing-frame, and duplicate-final semantics are absent.
- A live request for job `cmdjob_mrhwxrzr_4466b9d45b1a` returned unrelated output labeled `cmdjob_mrhwxmx0_e09d9ce09348`, proving that system-level response crossover still exists outside the intended validation boundary.

## Agent runtime and priority lanes

```text
incoming action
	-> correlation-scope extraction
	-> action classification
	-> P0 control | P1 fs-light | P2 chrome-light | P3 heavy | P4 bulk
	-> process-local lane queue
	-> action handler
	-> optional subprocess worker
	-> response envelope
```

The lane model protects control admission but has five coarse lanes, no explicit P1 human-interaction lane, no mission-coordination lane, no maintenance lane, no weighted aging, and no durable queue truth.

## Mission runtime

```text
mission action
	-> transaction key from root + missionId
	-> process-local keyed promise queue
	-> mission load / mutate / save
	-> daemon scheduler Map keyed by root + metadataRoot + missionId
	-> continuation gate
	-> mission action execution
	-> continuation accounting
```

### Observed mission identity

- Mission identity: `missionId`, root, metadata root.
- Room identity: room ID inside persisted mission state.
- Agent identity: `logicalAgentId`, `agentSessionId`, process key inside room records.
- Claim identity: generated claim ID, task ID, agent ID, file list.

### Critical ownership gap

The actual scheduler and continuation policy are mission-scoped. Room agents are durable descriptive records, but they do not each own an independent inbox, scheduler, current action, resource ledger, or control state. Per-agent controls must not be advertised as fully independent until that backend exists.

### Lock boundary problem

`daemon/schedulerLoop.js` holds the mission transaction while it performs the tick action and continuation accounting. The action may invoke long or external work. This creates head-of-line blocking and violates the rule that locks should not span network, model, command, or browser calls.

## Command jobs

```text
commandStart
	-> write metadata intent
	-> spawn child process
	-> process-local JOBS Map
	-> file-backed stdout/stderr and metadata
	-> heartbeat
	-> close/error receipt
	-> status-time reconciliation
```

### Observed strengths

- Intent metadata is written before spawn.
- Output is file-backed and paged.
- Missing live worker plus missing PID is reconciled to `stale_lost_worker`.
- Worker identity and receipts include mission and agent fields.

### Observed weaknesses

- PID liveness is trusted without a process birth token.
- Normal command jobs are spawned with `detached:false`.
- Cancellation signals one child PID rather than a process group and descendants.
- The active `JOBS` registry and worker registry are process-local.
- Output byte counts are computed by reading complete files.
- Completion, cancellation, and duplicate-start semantics do not use one canonical idempotency ledger.

## Browser runtime

```text
Chrome action
	-> one global actionQueue promise tail
	-> one module-global pageWs
	-> one module-global lastPageId
	-> one callbacks Map
	-> one in-memory targetLeases Map
	-> CDP operation
```

This architecture serializes browser mutation honestly but cannot provide true concurrent agent browsing. Target leases have no revision, expiry, heartbeat, durable cleanup receipt, or restart recovery. Cookies and storage operate on the globally active target and context.

## Frontend runtime

Tunnel Control contains mission room sockets, polling fallback, replay timers, room polling, auto-discovery polling, device polling, login polling, live mesh heartbeat, and multiple visual refresh intervals. Mission controls send revisioned mission-level actions and then query mission resource status.

### Frontend truth gap

The UI can display desired and observed mission state, but it cannot reconstruct authoritative per-agent runtime state after reconnect because the backend does not own independent per-agent schedulers and resource ledgers. Several intervals are locally owned rather than represented in one frontend lifecycle registry.

## OS and Code surfaces

The OS surface does not directly spawn native children in the inspected root; command and process execution flows through tunnel abstractions and supervisors. The Code app contains several process-local caches and pending-request maps. These surfaces should consume the new ownership snapshots rather than create parallel identity systems.

## Global mutable state inventory

Observed examples include:

- relay pending, completed, and quarantine stores;
- command `JOBS` Map;
- global worker registry;
- worker supervisor process Map and restart timers;
- mission transaction queue Map;
- mission scheduler Map and timers;
- Chrome socket, target ID, callback Map, target lease Map, and action tail;
- remote desktop server Map;
- ChatGPT hour-loop timer Map;
- virtual OS registries and watchers;
- frontend polling, replay, discovery, socket, and beauty intervals;
- Code command cache, pending REPL requests, settings memory, and chat memory.

## Status-field ambiguity

The code contains progress states such as `running`, `detached_running`, `completed`, `paused`, `draining`, `drained`, `stopped`, `budget-paused`, `active`, `idle`, and connection modes. Some already distinguish desired and observed mission state, but jobs, workers, browser sessions, sockets, and frontend subscriptions do not consistently follow that model.

## Current architecture verdict

The current system has many valuable local repairs, but it lacks one shared durable contract for operation identity, connection epochs, idempotency, sequence replay, resource ownership, process birth identity, and independent agent runtime state. The safest path is an isolated reference kernel and staged compatibility adapters—not further feature additions directly inside the live core.
