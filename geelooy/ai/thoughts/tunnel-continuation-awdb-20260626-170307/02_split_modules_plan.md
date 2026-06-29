B"H

# Split module plan

## New config/data files
- tools/fs/awdb/paths.js: all DB file names and module path suffixes.
- tools/fs/continuation/policy.js: max steps, max ms, action aliases, default one-hour limit.
- tools/fs/actionLedgerPolicy.js: retention values and skip action list.

## New AWDB infrastructure
- tools/fs/awdb/open.js: locate/open/withDb helpers.
- tools/fs/awdb/collections.js: ensure root collections and list helpers.

## Mission storage split
- tools/fs/mission/awdbStore.js: mission-specific save/load/list/status.
- tools/fs/mission/coreStorage.js: tiny facade preserving existing API.

## Action history split
- tools/fs/actionLedgerRedact.js: secrets/redaction only.
- tools/fs/actionLedgerStore.js: AWDB primary storage plus legacy fallback read.
- tools/fs/actionLedger.js: public API wrapper.

## Large response readback split
- lib/response-size.js: keep write/spill + export readOutputRef.
- tools/fs/actionGroups/readActions.js: read/read64 detects awdb://.

## Continuation split
- tools/fs/continuation/extractNext.js
- tools/fs/continuation/guard.js
- tools/fs/continuation/runner.js
- tools/fs/actionGroups/continuationActions.js
- tools/fs/actions.js wires actions.

## Tests
- missionAwdbStorage.test.mjs
- actionLedgerAwdb.test.mjs
- missionContinuationDriver.test.mjs
- largeResponseAwdbRead.test.cjs
