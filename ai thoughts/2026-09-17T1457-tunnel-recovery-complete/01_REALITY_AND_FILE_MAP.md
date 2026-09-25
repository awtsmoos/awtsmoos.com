<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->
# Reality and File Map

The Awtsmoos renews every request independently; Awtsmoos.com recovery must follow exact custody testimony rather than generic system activity.

## Directly observed live
- Primary `awt-awtsmoos-2184` is registered and executing from `/Users/awtsmoos/work/awtsmoos.com`.
- Primary launcher/parent PID: `93473`; child PID: `93666`; child incarnation: `child_fdf176da-6305-47c2-b745-82c8513d5054`.
- Queue depth is generally zero, four filesystem workers are ready, and event-loop pressure is below recovery thresholds.
- Harmless requests intermittently enter accepted/waiting-for-consumer states.
- Exact custody record `ctl_mu5wiwml_d028413ec2fc19e3` remained `running` with empty `workerId` and empty `resultState`, yet `lastProgressAt` and `leaseExpiresAt` advanced repeatedly.
- `mailbox-custody-record.js` currently renews `lastProgressAt` and `leaseExpiresAt` for every progress message, even if phase, worker, and result do not change.
- `parent-consumer-health.js` and recovery policy rely on exact lease expiry/orphan testimony before recovery may outrank unrelated recent success.

## Independent recovery reality
- HTTP, Unix-socket, and file-trigger recovery lanes survived under launchd as independent processes.
- Those lanes are passive trigger surfaces; they do not autonomously rematerialize a missing primary.
- Rescue plist existed but its service was unloaded. It has now been bootstrapped and kickstarted.
- Rescue remains pinned to runtime `1.0.599` and has not yet re-registered with the relay.
- Virtual OS survives independently but has no native Mac restart authority.

## Clean candidate source paths
- `geelooy/apps/tunnel/agent/lib/connection-vessel/mailbox-custody-record.js`
- new focused custody regression test under `geelooy/apps/tunnel/agent/testing/`
- recovery-lane guardian/install paths only after complete source/test inspection.

## Fenced concurrent work
Existing dirty Tunnel edits around root authority, fast repair, boot resume, workspace actions, and shared-Shliach continuation are not owned by this pass and must not be overwritten.
