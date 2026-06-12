B'H
# Plan: Fix /packed/stats Timeout

## Finding
The full real-server smoke now reaches GET /api/social/packed/stats and times out. This route calls allShardStats, which calls shardStats, which calls listPackedRecords for every shard. On live core shards this parses too much data for a status endpoint.

## Fix
Rewrite socialPacked.js stats functions:
- keep write/read/mirror functions unchanged semantically
- add lightweight shard file stats by file size/mtime for large shards
- exact record/key/type stats only when the shard is small enough
- allShardStats returns immediately for huge core shards with approximate=true

## Verification
- node --check socialPacked.js
- packedEngine/platform tests
- realServerWrites progresses past /packed/stats
