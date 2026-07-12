# B"H — Architecture Plan

## Phase 1: Correlation-safe relay

Rewrite the WebSocket relay as small modules with one public facade.

Files to create:

- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/constants.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/normalizers.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/register.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/expectation.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/validation.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/pendingStore.js`
- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/request.js`

File to rewrite:

- `ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js`

Behavior:

- Keep a pending record until a valid correlated response arrives or the durable expiry is reached.
- Attach multiple HTTP waiters to one pending record when callers retry with the same control request ID.
- Send the tunnel request exactly once per control request ID.
- Store every valid response in the completed cache before resolving waiters.
- Never put unsolicited or mismatched responses in the completed cache.
- Preserve mismatch evidence in a bounded quarantine ledger.
- Require job ID and stream presence when the request requires them.
- Preserve public exports used by existing routes and tests.

## Phase 2: Mission transaction and scheduler truth

Files to create:

- `geelooy/apps/tunnel/agent/tools/fs/mission/transaction/keyedSerial.js`
- `geelooy/apps/tunnel/agent/tools/fs/mission/transaction/index.js`
- `geelooy/apps/tunnel/agent/tools/fs/mission/daemon/state.js`
- `geelooy/apps/tunnel/agent/tools/fs/mission/daemon/scheduler.js`

Files to rewrite:

- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionActions.js`
- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionOperatingActions.js`
- `geelooy/apps/tunnel/agent/tools/fs/actionGroups/missionDaemonActions.js`

Behavior:

- Serialize all load/mutate/save cycles by project root and mission ID.
- Delete transaction entries after the final waiter exits.
- Report transaction metrics for stress verification.
- Make daemon start and stop change real scheduler state.
- Use bounded periodic ticks with one in-flight tick per root.
- Keep the scheduler advisory: it advances durable mission state and returns explicit next actions, but it never pretends that a language model is running when no provider process exists.

## Phase 3: Agent rooms and human steering

Files to inspect and selectively rewrite after backend verification:

- `geelooy/apps/tunnel-control/js/features/missionRooms/*`
- `geelooy/apps/tunnel-control/js/features/aiAgents.js`
- `geelooy/apps/tunnel-control/js/platform/liveTunnelMesh.js`
- `geelooy/apps/tunnel-control/js/shell/*`

Behavior:

- Show every agent with session, mission, current action, heartbeat age, claims, files, and pause state.
- Keep room chat bidirectional and durable.
- A blocking human message pauses only the relevant mission lane.
- Resume continues from the recorded next action.
- Agents discover rooms by normalized project-root affinity and explicit invitations.
- File claims prevent overlapping writes and expose conflicts before execution.

## Phase 4: One coherent visual system

Files to rewrite or add:

- `geelooy/apps/tunnel-control/css/app.css`
- `geelooy/apps/tunnel-control/css/future/index.css`
- focused future view modules for agent rooms, responsive layout, status, and command center
- `geelooy/apps/tunnel-control/js/ui/mount.js` or remove the obsolete path after import tracing

Behavior:

- Stop loading legacy visual layers over the future system.
- Use one token scale, one spacing system, one typography hierarchy, and one responsive shell.
- Make active agents, room chat, work graph, command workers, browser leases, and virtual OS portals first-class panels.
- Ensure touch targets, keyboard navigation, reduced motion, readable contrast, and narrow-screen layouts.

## Phase 5: Virtual OS and Code convergence

Inspect and integrate existing modules under:

- `geelooy/os/vfs`
- `geelooy/os/tunnel`
- `geelooy/os/process`
- `geelooy/os/programs/awtsmoos-command`
- `geelooy/apps/code`

Behavior:

- Keep the database-backed virtual filesystem distinct from local tunnel files, with explicit vessel badges.
- Route commands either to a local tunnel worker or a constrained virtual runtime.
- Represent startup servers as supervised processes with receipts, ports, health, restart policy, and ownership.
- Reuse the same agent-room and worker identity model across Tunnel Control, Code, and the OS.

## Delivery order

Correlation safety comes first, then mission transactions and scheduler truth, then UI convergence, then OS/Code integration. A beautiful control room built on crossed responses would only make corruption easier to overlook.
