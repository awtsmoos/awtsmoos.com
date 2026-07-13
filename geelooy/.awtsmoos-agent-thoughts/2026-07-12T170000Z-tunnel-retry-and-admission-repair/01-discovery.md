B"H

# Phase 1 — Discovery Record

## Mission

Repair the tunnel repository without changing Git history or the running installation.

## Verified failure surfaces

- `retryAction` can lose the original `controlRequestId` when the relay creates a new outer request.
- `stateRoots.js` was required by production code but absent from the packaged source.
- Logical queue and retry registries had compiled finite defaults.
- The basic-stable emergency startup intentionally skipped reconciliation, mission boot, and updates.
- Plain text logs had no size boundary.

## Safety boundary

- Keep AwtsmoosDB and mission persistence unchanged.
- Preserve finite physical execution lanes.
- Remove fixed logical-agent admission ceilings by default.
- Apply full-file replacements only.
- Rebuild and verify the manifest before any reinstall.
