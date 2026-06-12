B'H
# Plan: Fix /packed/snapshot Timeout

## Finding
The full real-server smoke times out exactly at GET /api/social/packed/snapshot. The route calls exportPackedSnapshot, which calls allShardStats. allShardStats parses every record in core, and this DB has hundreds of thousands of core records. The route is operational metadata and should not parse the entire core sea.

## Fix
Rewrite packed/snapshot.js:
- avoid allShardStats
- provide lightweight per-shard file existence/size/mtime stats
- keep exact manifest counts from meta shard because meta is small and semantically required
- keep exact indexStats from search shard because tests need it and search is much smaller

## Verification
- node --check snapshot.js
- packedSnapshotRepair.test.js
- direct /packed/snapshot probe under timeout
- rerun realServerWrites

Chapter 10: The Watchman Stopped Counting Every Grain Of Sand
The watchman had been ordered to say whether the desert existed, so he counted every grain. The Awtsmoos laughed gently: look at the dune, not every atom.
