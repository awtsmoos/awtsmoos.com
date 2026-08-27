B"H

# Remote Desktop Tunnel: Large Next Layer

## New in this layer

- `remoteDesktopPermissionContract` returns a hash-sealed permission contract with copyable text.
- `remoteDesktopSessionSummary` returns human-readable lifecycle, grants, countdown, and audit trail.
- `remoteDesktopSignalSummary` returns peer signaling and heartbeat summary.
- Android helper skeleton files now exist under `agent/docs/helper-skeletons/android`.
- Desktop helper skeleton files now exist under `agent/docs/helper-skeletons/desktop`.
- Tunnel Control now has Contract, Summary, and Signals buttons.

## Helper skeletons created

Android:
- `README.md`
- `ConsentActivity.kt`
- `CaptureService.kt`

Desktop:
- `README.md`
- `main.ts`

These are not installed services; they are concrete source skeletons and consent contracts for the native helper implementation.

## Current active guarantees

- Permission contract hash is deterministic for the current consent body.
- Session summaries expose countdown and grant state.
- Signal summaries expose fingerprints and heartbeats.
- Pause/revoke still block frame/signaling/input flows.
- Mouse and keyboard grants remain separate.
