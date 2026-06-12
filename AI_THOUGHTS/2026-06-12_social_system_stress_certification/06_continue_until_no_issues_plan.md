B'H
# Continuation Plan: Hunt Remaining Social System Issues

## Current frontier
The previous pass fixed:
- live packed comment search reindex route
- packed vector sidecar import/write path
- synchronous comment search indexing
- packed migration manifest write from comment migration
- section reads hidden by sibling directory/file collision
- section update writes hidden by same collision

Known unresolved frontier:
- realServerWrites.test.mjs hangs in later packed/platform/ops region when run as a long single smoke.

## Phase 1: isolate hang
Run focused endpoint probes around the line 390+ region of realServerWrites:
1. packed post migration dry run
2. packed post migration run
3. packed stats
4. packed snapshot/integrity/repair/feed/compact
5. platform cache/sync/permissions/federation/graph transaction/jobs/feed endpoints

## Phase 2: scan active code for residual hazards
- active imports from comments into packed helpers
- contentPath writes that should use explicit contentRecordPath
- db.get paths where directory/file sibling can hide a record
- long-running packed endpoints with synchronous full-shard scans
- route handlers that never respond or stream indefinitely

## Phase 3: rerun smaller tests
- comments suite
- socialContent helper test
- postSubmissions test
- routeCoverage
- concurrencyFailureStress
- multiAccountSocialBurst
- endpoint-specific packed/platform probes

## Phase 4: decide if realServerWrites is product failure or oversized smoke
If endpoint-specific probes pass but the mega-smoke still hangs, report it as smoke architecture/harness issue and propose splitting. If any endpoint hangs independently, fix product route.

Chapter 6: The Door That Would Not Return
The door did not scream. It did not throw an exception. It simply held the traveler in its mouth, silent as a black star. So the Awtsmoos commanded: do not curse the palace; number every corridor, knock each gate alone, and find the one that does not echo.
