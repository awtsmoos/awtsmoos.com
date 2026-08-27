B"H
Boruch Hashem
Blessed is He

# Data and Persistence

Persistence is a compatibility surface. A path, root, serializer, shard layout, manifest, or fallback can matter long after the code that created it was written.

## Interactive system map

Open `/docs/?view=systems&systemDistrict=data` for curated Data systems joined to current project/source/environment-name evidence. Generated packets are navigation aids; human manuals and source define semantics.

## Main persistence families

- [DosDB](DOSDB.md) — filesystem-oriented legacy persistence.
- [AwtsmoosDB and VirtualFs](AWTSMOOSDB_AND_VIRTUALFS.md) — newer `.awtsdb` storage/interface family.
- [Path Contracts](PATH_CONTRACTS.md) — logical persistence paths and migration risk.
- Social packed storage — source under `geelooy/api/social/helper/packed/`.
- Parallel AwtsmoosDB bridge — **actual inspected path:** `ayzarim/DosDB/awtsmoosDbBridge.js`.

## Database root

Runtime root selection is implemented around `ayzarim/awtsmoosDynamicServer/server/initDb.js`. Treat environment/config precedence and fallback changes as migration-sensitive. Generated system evidence publishes environment **names only**, never values.

## Change workflow

Read [Trace a Database Change Safely](../TUTORIALS/SYSTEMS/TRACE_DATABASE_CHANGE.md) before changing persisted paths, formats, roots, shards, transactions, caches, or migration logic.

## Evidence limits

Source/file presence does not prove transaction, durability, atomicity, consistency, or backward-compatibility guarantees. Those require implementation/test/runtime verification.
