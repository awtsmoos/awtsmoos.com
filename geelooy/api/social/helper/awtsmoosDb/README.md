# B"H — AwtsmoosDb Shard Engine (geelooy/api/social/helper/awtsmoosDb/)

Storage engine for AwtsmoosDB shards, used by social data that lives in sharded files rather than a single database.

## Files
- `shardEngine.js` — core read/write engine over sharded data.
- `shardRoot.js` — resolves the shard root for a given key/dataset.
- `shardStore.js` — higher-level store operations on top of the engine.
- `test/` — engine/root/store tests.

## What it does
Partitions social data into shards (by key ranges/buckets), routes reads and writes to the right shard, and presents a store-like interface over the underlying sharded files.
