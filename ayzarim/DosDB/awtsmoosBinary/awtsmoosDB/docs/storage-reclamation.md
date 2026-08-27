B"H

# AwtsmoosDB Storage Reclamation

## Strict read-only inspection

```js
const AwtsmoosDB = require('../index.js');

const db = new AwtsmoosDB(databasePath, {
	readOnly: true
});

db.open();
try {
	console.log(db.storageReport());
	console.log(db.semanticDigest());
} finally {
	db.close();
}
```

Strict read-only mode opens the database through an operating-system `r` descriptor. It does not create, replay, truncate, or clear a WAL. It creates no writer lock or reader marker. Pager and VirtualFs mutation attempts throw `AWTSMOOS_DB_READONLY_WRITE`.

A strict reader is not a replacement lease. Production exchange still requires the server and every reader/writer to be stopped and independently proven absent.

## Verified free-space reuse

```js
const db = new AwtsmoosDB(databasePath, {
	reuseFreedSpace: 'verified'
});
```

Before a persisted free range may be reused, the allocator performs a fresh reachability walk and requires every claimed range to be contained in the verified complement. Unsafe, overlapping, out-of-bounds, superblock-crossing, or still-reachable claims are quarantined and never allocated.

Use `reuseFreedSpace: false` when deliberately preserving append-only forensic behavior. The historical boolean `true` compatibility mode remains available but does not provide the fresh verification gate.

## Storage telemetry

```js
const report = db.storageReport();
```

The report separates:

- physical file bytes;
- logical cursor bytes;
- reachable bytes;
- persisted free-list claims;
- freshly verified free bytes;
- trailing physical bytes;
- range fragmentation;
- WAL, writer-lock, and reader-marker state;
- out-of-place vacuum eligibility.

Persisted free metadata is never presented as proof.

## Vector bulk loading

```js
const result = db.vector.bulkLoad(db.root.records, records, {
	dimensions: 384,
	metric: 'cosine',
	chunkSize: 250
});
```

The collection must be unindexed. Records are loaded in bounded chunks, then one final HNSW rebuild occurs. A second bulk load against an existing graph is refused with `AWTSMOOS_DB_VECTOR_BULK_ALREADY_INDEXED`.

## Out-of-place vacuum

```js
const manifest = AwtsmoosDB.vacuumFile(
	sourcePath,
	destinationPath,
	{
		manifestPath,
		cleanupOnFailure: true
	}
);
```

The source must exist and the destination and destination sidecars must not exist. The source is opened strict read-only. The candidate is reconstructed from logical values; ABLB, ATXT, and VirtualFs bodies are relocated; search and vector indexes are rebuilt against destination pointers.

A candidate is accepted internally only after source and destination allocation verification, root-order comparison, semantic digest comparison, and source SHA/size/mtime/inode invariance. The returned manifest always sets `productionEligible: false` because API, vector-sidecar, real VirtualFs inventory, exclusivity, archive, restart, and rollback gates exist outside the storage engine.

## Command-line vacuum

```bash
node scripts/vacuum_awtsdb.js SOURCE DESTINATION \
	--manifest DESTINATION.vacuum-manifest.json \
	--cleanup-on-failure
```

`compact_awtsdb.js` no longer accepts a single source path. In-place compaction is intentionally unavailable.

## Production exchange

The storage engine provides separately tested manifest-gated swap and rollback primitives. They are not called by vacuum. A production operation must use an approved maintenance window, stopped-server exclusive ownership, current hashes, a verified external archive, same-filesystem distinct paths, post-install verification, API smoke checks, restart checks, and immediate rollback on any discrepancy.
