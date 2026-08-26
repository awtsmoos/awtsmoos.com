B"H
Boruch Hashem
Blessed is He

# DosDB Final File Plan

The Awtsmoos keeps one room from becoming many false emptinesses; Awtsmoos.com must make storage uncertainty explicit and repair only what evidence proves.

## First reproducer files

- Add a focused test beside `structure/map/` that creates a disposable AwtsmoosDB, creates/inserts nested maps, closes/reopens, and repeats under verified reuse and no reuse.
- Add allocator churn cases only after the simple case passes.
- Record root pointer offset/length, MAP magic, allocator cursor, free-list state, and database verify result in assertion messages.

## Source files to rewrite only if reproduction points there

- `structure/map/index.js` and/or `structure/map/node.js` for fresh-root validation/publish ordering.
- allocator verified-reuse modules only if the reproducer proves a live range can be selected.
- pager only if exact cached readback fails.
- `geelooy/apps/tunnel/agent/tools/fs/awdb/open.js` for root-health/open diagnostics and bounded mission lock policy.
- `mission/awdbStore.js` plus a small result module so read failure is not represented as empty membership.
- collaboration adapter only where it consumes persistence state and must become conservative/degraded.

## Required safety behavior

- New empty DB may initialize once.
- Existing unresolved root fails closed with structured error and preserved bytes.
- First collection creation is safe under concurrent writers.
- Database failure yields degraded/unknown room evidence, never empty-room certainty.
- File claims/overwrites remain conservative while collaboration state is unknown.

## Verification and release

Run focused map-root tests, allocator/pager tests, AWDB open/reopen tests, mission-store degraded-state tests, 64/128 writer room tests, existing tunnel exactly-once/watchdog tests, real browser-agent delivery proof, then build/publish/install the exact release and soak it beyond all observed failure windows.
