# B"H — Implementation Delta

## Original intent

Build a tunnel-centered environment where many AI conversations can work for long periods without crossing responses, losing mission state, fighting over browser tabs, or presenting false UI activity. Strengthen Tunnel Control, Mission Rooms, the virtual OS, and Code while preserving real local files and native tunnel execution.

## Implemented

### Transport identity

- Replaced the monolithic relay with small modules for normalization, expectations, lifecycle, completed-response cache, quarantine, aliases, path validation, and response identity.
- Kept pending tunnel work alive after the HTTP-safe wait window.
- Coalesced retries by `controlRequestId`.
- Rejected same-ID requests with conflicting identity.
- Quarantined unsolicited and crossed responses without consuming the true pending request.
- Validated tunnel, action alias, control/client/session/agent IDs, project root, nonce, job, stream, command, cwd, and path.
- Added explicit `shellCommand -> commandRun|commandStart` compatibility.

### Mission continuation

- Added a leak-free keyed transaction queue for mission mutations.
- Serialized one mission while allowing unrelated missions to run in parallel.
- Added `mustCallNext` compatibility to mission-room discovery.
- Replaced ceremonial daemon start/stop responses with a real bounded scheduler, one in-flight tick, durable status, overlap accounting, recovery, and clean stop.

### Browser isolation

- Added a single-socket Chrome action queue for target-changing operations.
- Added explicit target acquisition/release with stable mission, room, browser-session, or agent scope.
- Preserved concurrent read-only browser inspection.
- Registered new browser actions in scheduler priority lanes.

### Tunnel Control

- Removed the legacy stylesheet from the active cascade.
- Replaced the dead duplicate mount path with one idempotent boot doorway.
- Added a truthful live command deck showing tunnel identity, room counts, human gates, selected agents, action transport, failures, and steering entry points.
- Read existing Mission Rooms and Live Actions DOM state rather than inventing a second store or sample agents.
- Added responsive desktop/tablet/mobile grids, touch-sized controls, reduced-motion handling, and normal document scrolling.
- Added a modern compatibility vocabulary for existing feature panes without reviving legacy global CSS.

### Virtual OS

- Added supervised process records with owner, agent identity, health, ports, singleton services, restart policy, restart caps, filtering, cleanup, graph sync, and bounded retention.
- Restored canonical `/network/tunnels` plus broad `/network` and legacy `awtsmoos://tunnels` mounts.
- Split mobile styling into small desktop, search, window-sheet, and system-chrome modules.
- Preserved the File Explorer's single future style source.

### Code browser Node runtime

- Added bounded logs and history.
- Added deterministic worker, Blob URL, server, socket, and pending-request cleanup.
- Added HTTP timeouts and port-conflict rejection.
- Added startup services and terminal commands: `node --startup`, `node service`, `node ps`, and `node stop`.

## Planned versus actual

The original plan expected a broad UI and concurrency rewrite. The actual work went deeper at the identity and lifecycle boundaries because live testing revealed crossed tunnel replies, stale job receipts, shared Chrome-target replacement, and non-transactional mission mutation. The implementation therefore prioritizes correctness and truthful state before decorative expansion.

## Files intentionally not changed

Unrelated existing changes under Mitzvah World, the main UI redesign thought directory, and `geelooy/style/geelooy-app` were left untouched.
