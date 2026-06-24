# B"H — Tunnel Control Reconstruction Audit Discovery

## User mission
Transform tunnel-control from a large scrolling admin dashboard into a professional multi-agent mission operating system with room intelligence, mission intelligence, delegation, synchronization, ownership, claims, recovery, persistence, auditability, multi-page UI, mobile excellence, and no giant JSON bottlenecks.

## Evidence rules
No architectural claim is accepted unless backed by direct file read, command output, runtime observation, or verified test result.

## Initial observed root
Repository root exists at `/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com`.
Primary app target exists at `geelooy/apps/tunnel-control`.
Primary API target exists at `geelooy/api/tunnel/control`.
Tunnel agent target exists at `geelooy/apps/tunnel/agent`.
DosDB target exists at `ayzarim/DosDB`.

## First known work graph
1. Build runtime/import/state/room/agent/persistence maps.
2. Inspect app router and page registry.
3. Inspect mission/room/sync/delegation/client features.
4. Inspect API persistence stores and live calls.
5. Inspect tunnel agent duplicate replacement and manifest generation.
6. Identify the smallest safe architectural implementation slice.
7. Rewrite whole files only, or add small new files.
8. Verify with targeted tests and runtime smoke.
