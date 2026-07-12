# B"H — Test Evidence

## Relay

- Existing timeout, default-clean, correlation, and command-correlation suites.
- 200 crossed-response injections.
- 400 callers coalesced into 200 outbound requests.
- Late completion followed by retry without resend.
- Unsolicited-response quarantine.
- Same control ID with conflicting identity rejected.
- `shellCommand` served by `commandStart`; wrong command text quarantined.

## Mission and daemon

- 300 same-mission mutations completed with 300 durable increments and maximum one active writer.
- 80 unrelated missions ran concurrently.
- Transaction registry returned to zero keys.
- Daemon performed repeated ticks, never overlapped itself, counted skipped overlap attempts, stopped cleanly, and left no transaction keys.
- Mission-room action, loop, and human-interrupt suites passed in focused runs.

## Chrome

- 120 queued target-changing operations completed with maximum one active operation.
- Queue returned to zero active and zero waiting operations.
- Browser-scope-required contract verified.

## Tunnel Control

- Every JavaScript file in Tunnel Control passed `node --check` during the full syntax sweep.
- Dashboard isolated DOM test passed.
- All 37 future CSS imports resolved.
- New dashboard and command-deck modules were split below the 120-line source limit.

## Virtual OS

- Process supervisor smoke covered 500 unique process records, singleton reuse, port conflict, heartbeat, restart caps, and cleanup.
- Focused VFS mount smoke passed after restoring `mount:tunnels`.
- Focused mobile, unified-style, command-program, and mount smokes completed without a new reported failure in independent receipts.
- The aggregate command receipt became stale while no OS child process remained; therefore aggregate-suite completion is not claimed from that stale receipt.

## Code

- Node lifecycle test covered HTTP routing, port conflict, 2,000-line log cap, worker termination, server cleanup, process removal, and bounded history.
- Focused AI Studio and OS-provider adapter commands were run independently after the aggregate-receipt issue.

## Syntax and structure

- Rewritten relay, mission daemon, Chrome, process, Node runtime, dashboard, and mobile modules were syntax-checked.
- Oversized new relay validation and daemon scheduling files were split into smaller modules after audit.

## Evidence caveat

The running tunnel agent was not restarted after its own source changed. Unit and isolated runtime evidence applies to the written code; live availability of the new Chrome acquire/release actions requires an agent restart.
