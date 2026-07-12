# B"H — Failure-Mode Inventory

## Severity model

- Critical: can corrupt attribution, cross users or agents, or make safety controls ineffective.
- High: can lose durable work, leak external resources, or block recovery.
- Medium: can degrade observability, fairness, or operational clarity.
- Low: creates friction without threatening correctness.

## Transport and correlation

| Failure | Severity | Evidence | Required containment |
|---|---|---|---|
| Crossed command output | Critical | Observed job `cmdjob_mrhwxrzr_4466b9d45b1a` request received job `cmdjob_mrhwxmx0_e09d9ce09348` output | Validate complete immutable identity at every boundary; quarantine mismatch; durable operation ledger |
| Old socket races new socket | Critical | Registration closes prior socket but has no enforced connection epoch | Issue monotonically increasing epoch and reject stale frames |
| Retry conflicts | Critical | Existing relay compares expectation but lacks canonical idempotency hash | Persist key + canonical request hash; coalesce identical; reject conflict |
| Process restart loses pending truth | High | Relay stores are memory-only | Durable pending and completed operation store |
| Stream frame reordering | High | No event sequence model observed | Per-stream sequence, acknowledgment, replay window, gap errors |
| Unsolicited response poisoning | Critical | Prior evidence; current code quarantines at relay but system-level crossover remains | One shared validator before any cache or waiter resolution |
| Pending timer leak | Medium | Each pending request owns expiry timer outside a ledger | Timer resources owned and reconciled; fake-clock leak tests |
| Reconnect storm | High | No explicit bounded epoch-resume protocol | Bounded retries, jitter, admission limits, resume query |
| Buffer exhaustion | High | No unified pending-byte cap | Per-connection and global byte quotas with structured overload |

## Mission and agent runtime

| Failure | Severity | Evidence | Required containment |
|---|---|---|---|
| One mission lock spans external work | Critical | `schedulerLoop.runTick` holds transaction around tick action | Persist intent, release transaction, perform work, reconcile receipt |
| Per-agent controls are not independently owned | Critical | Scheduler and continuation control are mission-scoped | Durable runtime per logical agent and session |
| Stale task claim overwrites new owner | Critical | Room claims lack revision, heartbeat, expiry, and mode | Compare-and-swap revisioned claims |
| Duplicate node execution | High | No unified node-attempt idempotency contract | Attempt IDs, leases, canonical action keys, duplicate receipt handling |
| Graph cycle or deadlock | High | Existing broad mission graph layers not proven by one validator | Activate only acyclic graph; blocked-node diagnostics |
| Crash loses current turn context | High | Agent checkpoints are not the scheduler’s core ownership contract | Persist compact checkpoint before releasing turn lease |
| One-turn credit consumed twice | High | Existing implementation is transaction-protected only at mission scope | Atomic agent-level credit consumption with revision |
| Drain misreported as complete | High | Drain gate stops new ticks but no finishing-current-action state | desired `draining`, observed `finishing-current-action`, final drain receipt |
| Human message races completion | High | Multiple room channels and mission mutation paths | Revisioned interrupt event and resumable checkpoint |
| Mission policy precedence ambiguity | Medium | Mission-level controls exist; room/agent/task precedence incomplete | Explicit precedence evaluator with receipts |

## Command jobs

| Failure | Severity | Evidence | Required containment |
|---|---|---|---|
| PID reuse causes wrong process signal | Critical | Reconciliation and cancel trust PID alone | PID plus process birth token/start time |
| Descendant survives cancel | High | Command jobs use `detached:false` and child PID kill | Process groups, TERM deadline, KILL escalation, descendant receipt |
| Lost exit receipt | High | Prior stale worker evidence; file metadata may remain running | Startup reconciliation and periodic supervisor reconciliation |
| Duplicate job start | High | No canonical idempotency key in command store | Persist idempotency key and command hash before spawn |
| Output disk growth | High | File output retention exists but byte accounting reads full files | Chunk metadata, total caps, bounded retention and compaction |
| Disk-full during receipt | Critical | No observed fault-injection proof | Atomic write strategy and explicit `receipt_persist_failed` state |
| Cancellation race with completion | High | Multiple paths can finalize metadata | Revisioned terminal transition; duplicate identical receipt coalescing |
| Worker registry disappears on restart | Medium | Registry is process-local | Rebuild snapshot from durable jobs and resources |

## Browser and Chrome

| Failure | Severity | Evidence | Required containment |
|---|---|---|---|
| Agent target theft | Critical | One global socket and mutable `lastPageId` | Per-target CDP session and explicit lease |
| Cookies/storage cross agents | Critical | Active global page/context used by session actions | Per-agent browser context isolation |
| Lease survives no owner | High | In-memory leases have no expiry or heartbeat | Durable lease with owner heartbeat and cleanup deadline |
| Socket replacement rejects unrelated callbacks | High | `closeCurrent` rejects all callbacks | Session-local callback maps |
| Browser disconnect leaves stale state | High | No durable observed-state reconciliation | Browser supervisor and startup target/context reconciliation |
| Screenshot attribution mismatch | Critical | Screenshot uses whichever target owns active socket | Bind screenshot to lease and target ID in request and receipt |
| Browser process leak | High | No complete process/context ledger | Resource owner, cleanup contract, leak test |

## Resource lifecycle

| Failure | Severity | Evidence | Required containment |
|---|---|---|---|
| Resource has no owner | Critical | Timers, sockets, maps, callbacks spread across modules | Mandatory ownerType/ownerId and cleanup method |
| Cleanup silently fails | High | Many catch blocks discard cleanup errors | Idempotent cleanup receipts with last error and retry |
| Registry grows without cap | High | Several process-local Maps; some bounded, some not proven | Count/byte/age limits and snapshots |
| Timer outlives scope | Medium | Multiple backend and frontend intervals | Lifecycle registry and mount/unmount leak tests |
| Temporary files remain | Medium | Commands and tests create temp stores | Temporary resource records and cleanup verification |
| Emergency cleanup blocks | Critical | No independent cleanup executor | P0 cleanup lane with reserved capacity |

## Frontend and human control

| Failure | Severity | Evidence | Required containment |
|---|---|---|---|
| UI reconstructs truth from stale local state | High | Multiple polling/socket fallbacks and local timers | Backend snapshot plus resume cursor |
| Destructive scope ambiguity | Critical | Current controls operate selected mission while fleet/agent concepts coexist | Visible scope selector next to each mutation |
| Fleet operation partially succeeds invisibly | High | No per-agent batch receipt model | Dry-run and result receipt per entity |
| Polling/listener leak | Medium | Many intervals across shell, rooms, live mesh, visual modules | One frontend resource registry and repeated mount tests |
| Preset hides actual policy | Medium | Presets currently map to values but UI should expose expansion | Show computed values before apply |
| Control waits behind heavy work | Critical | P0 exists but full six-lane proof absent | Dedicated control executor and saturation tests |

## Storage, clocks, and recovery

- Partial write between intent and side effect.
- Side effect succeeds but completion persistence fails.
- Completion persists but dependent scheduling fails.
- Wall clock moves backward or forward.
- Retention compacts an unread stream.
- Schema upgrade opens an older store.
- Disk becomes full during heartbeat or cleanup.
- Store becomes temporarily unavailable during Stop.
- Two processes attempt the same revision.
- Temporary test store accidentally points to production.

Every boundary requires a deterministic fault point and a recovery expectation.

## Security and privacy

- Raw command text, environment, cookies, or response bodies enter event logs.
- Root or cwd canonicalization permits ambiguous vessel identity.
- A legacy adapter silently drops an identity field.
- A frontend displays secrets in resource metadata.
- A stale browser context exposes another agent’s session.

The reference design must redact at event creation, not at presentation.

## Readiness consequence

The observed crossed response alone makes live migration unsafe. The lock boundary, single CDP socket, PID-only reconciliation, and mission-scoped agent control independently prevent a safe-live verdict. The replacement must prove containment in isolated tests before any shadow adapter is proposed.
