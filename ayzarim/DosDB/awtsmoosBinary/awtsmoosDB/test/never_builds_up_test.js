// B"H

/**
 * @file never_builds_up_test.js
 * @chapter Future Writes Never Build Up Like The Old Ones
 * @description
 * Regression tests for the §8 fix design (FINDINGS.md): retired map
 * nodes freed at write time, the bulk path no longer skipping frees,
 * node checksums failing closed on torn writes, scheduled maintenance
 * gc + storage health alerts, and the production vacuum procedure
 * (dry-run refusal gates + a full swap on a scratch database).
 * The full-scale growth probe lives beside the investigation
 * (probe-never-builds-up.js): 500 x 50 KB records, small bulk
 * publishes below the 4 MB complement-refresh gate — bulk grew
 * +3,072,000 bytes before the fix and +51,200 after it.
 *
 * This test is deliberately synchronous: the lightning runner
 * strips every `await` from test source (syncify), so an async
 * bulk write would still be in flight when the assertions run.
 * The bulk arm drives PathAccess.set inside db.batch() — exactly
 * what a flushed writePath batch calls (pathWriteBatch._apply).
 */

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

const fs = require('fs');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');
const nodeChecksum = require('../utils/nodeChecksum.js');
const { runProductionVacuum } = require('../core/swap/productionVacuum.js');
const MapEngine = require('../structure/map/index.js');
const SequenceEngine = require('../structure/sequence/index.js');
const SmartPointer = require('../utils/smartPointer/index.js');

function fresh(name, options = {}) {
	const file = TempDbPath.make(name);
	TempDbPath.remove(file);
	const db = new AwtsmoosDB(file, { compression: false, wal: false, ...options });
	db.open();
	return { db, file };
}

function closeAndRemove(db, file) {
	try { db.close(); } catch (_error) {}
	TempDbPath.remove(file);
}

// Bulk-path write, synchronously: what PathWriteBatch.flush calls
// for one enqueued writePath, inside the same db.batch boundary.
function bulkWrite(db, key, value) {
	db.batch(() => db.concurrent.access.set(['records', key], value));
}

// 1. Bulk path frees the old value at write time (no complement
// refresh needed): one 50 KB record, overwritten repeatedly. The
// first overwrite grows by one value — the new value is built
// before the old one is freed — but from there on the freed range
// is reused and the file stays flat.
{
	const { db, file } = fresh('nbu-bulk');
	const SIZE = 50 * 1024;
	bulkWrite(db, 'k0001', Buffer.alloc(SIZE, 1));
	db.waitForIdle();
	bulkWrite(db, 'k0001', Buffer.alloc(SIZE, 2));
	db.waitForIdle();
	const afterFirst = db.storageStats().logicalBytes;
	const freed = (db.allocator.freeList || []).reduce((sum, range) => sum + range.length, 0);
	assert(freed >= SIZE * 0.9,
		`first bulk overwrite must leave the old value in the free list, freed ${freed}`);
	bulkWrite(db, 'k0001', Buffer.alloc(SIZE, 3));
	bulkWrite(db, 'k0001', Buffer.alloc(SIZE, 4));
	db.waitForIdle();
	const afterLater = db.storageStats().logicalBytes;
	assert(afterLater - afterFirst < SIZE / 2,
		`later bulk overwrites must reuse freed value bytes, grew ${afterLater - afterFirst}`);
	const report = db.storageReport();
	assert(report.verification.ok, 'verify ok after bulk overwrite');
	// Unreachable includes the free list's one pending value
	// (freed, awaiting reuse), so the bound is one value + a
	// little structure — not zero. Before the fix the bulk path
	// left every superseded value unreachable (~3 x 51 KB here).
	assert(report.unreachableLogicalBytes < SIZE + 20 * 1024,
		`unreachable must stay bounded to one pending value, got ${report.unreachableLogicalBytes}`);
	const value = db.root.records.k0001;
	assert(Buffer.isBuffer(value) && value.length === SIZE && value[0] === 4, 'new bulk value readable');
	closeAndRemove(db, file);
}

// 2. Plain path: repeated overwrites stay flat, and deletes retire
// their structure — re-inserting the same keys reuses the freed space.
{
	const { db, file } = fresh('nbu-plain');
	const SIZE = 20 * 1024;
	for (let i = 0; i < 50; i++) db.root[`k${String(i).padStart(3, '0')}`] = Buffer.alloc(SIZE, i % 251);
	db.waitForIdle();
	const afterInsert = db.storageStats().logicalBytes;
	for (let round = 1; round <= 3; round++) {
		for (let i = 0; i < 50; i++) db.root[`k${String(i).padStart(3, '0')}`] = Buffer.alloc(SIZE, (round * 7 + i) % 251);
	}
	db.waitForIdle();
	const afterUpdates = db.storageStats().logicalBytes;
	assert(afterUpdates - afterInsert < SIZE,
		`plain overwrites must stay flat, grew ${afterUpdates - afterInsert}`);
	for (let i = 0; i < 50; i++) delete db.root[`k${String(i).padStart(3, '0')}`];
	db.waitForIdle();
	const freed = (db.allocator.freeList || []).reduce((sum, range) => sum + range.length, 0);
	assert(freed >= 50 * SIZE * 0.5, `deletes must free the value bytes, freed ${freed}`);
	assert(db.verify().ok, 'verify ok after deletes');
	closeAndRemove(db, file);
}

// 3. Bulk-load tree retirement: replacing a multi-node map tree
// frees its descendant nodes (reindex path).
{
	const { db, file } = fresh('nbu-bulkload');
	const engine = new MapEngine(db.allocator);
	const entries = [];
	for (let i = 0; i < 500; i++) {
		entries.push({ key: Buffer.from(`token-${String(i).padStart(4, '0')}`), value: db.allocator.save(`v${i}`) });
	}
	engine.bulkLoadSorted(entries);
	const freeBefore = (db.allocator.freeList || []).reduce((sum, range) => sum + range.length, 0);
	const replacement = [];
	for (let i = 0; i < 500; i++) {
		replacement.push({ key: Buffer.from(`token-${String(i).padStart(4, '0')}`), value: db.allocator.save(`w${i}`) });
	}
	engine.bulkLoadSorted(replacement);
	const freeAfter = (db.allocator.freeList || []).reduce((sum, range) => sum + range.length, 0);
	assert(freeAfter > freeBefore, `bulk load must retire the previous tree, free ${freeBefore} -> ${freeAfter}`);
	assert(db.verify().ok, 'verify ok after bulk-load replacement');
	closeAndRemove(db, file);
}

// 4. Sequence root-split guard: pushing past the 200-item split
// keeps the old root alive as a child — it must NOT be freed.
// (A wrong free would corrupt the tree and fail verify / reads.)
{
	const { db, file } = fresh('nbu-seq-split');
	const seq = new SequenceEngine(db.allocator);
	for (let i = 0; i < 250; i++) seq.push(db.allocator.save(`item-${i}`));
	for (let i = 0; i < 250; i++) {
		assert(String(seq.get(i)) === `item-${i}`, `sequence item ${i} must survive its root split`);
	}
	assert(db.verify().ok, 'verify ok after sequence root split');
	closeAndRemove(db, file);
}

// 5. Node checksums: a torn map node fails closed; a legacy node
// without a trailer still loads.
{
	const content = Buffer.from('AMAP-checksum-test');
	const sealed = nodeChecksum.appendTrailer(content);
	assert(nodeChecksum.checkTrailer(sealed, content.length) === 'checksummed', 'trailer must verify');
	assert(nodeChecksum.checkTrailer(content, content.length) === 'legacy', 'untrailered bytes are legacy');
	const torn = Buffer.from(sealed);
	torn[10] ^= 0xff;
	assert(nodeChecksum.checkTrailer(torn, content.length) === null, 'torn content must fail the trailer check');
	const { db, file } = fresh('nbu-checksum');
	const nodeIO = new (require('../structure/map/node.js'))(db.allocator);
	const seal = nodeIO.save({ isLeaf: true, keys: [Buffer.from('a'), Buffer.from('b')], values: [db.allocator.save('1'), db.allocator.save('2')] });
	const decoded = SmartPointer.decode(seal);
	const raw = db.pager.readExact(decoded.offset, decoded.length);
	assert(raw && raw.length === decoded.length, 'saved node readable at its seal');
	assert(nodeIO.load(decoded) !== null, 'checksummed node must load');
	// Corrupt one content byte (not the trailer): load must fail closed.
	const corrupted = Buffer.from(raw);
	corrupted[8] ^= 0xff;
	db.pager.writeExact(decoded.offset, corrupted);
	assert(nodeIO.load(decoded) === null, 'torn map node must fail closed, not parse as garbage');
	// Corrupt the trailer itself: also fail closed.
	const badTrailer = Buffer.from(raw);
	badTrailer[badTrailer.length - 1] ^= 0xff;
	db.pager.writeExact(decoded.offset, badTrailer);
	assert(nodeIO.load(decoded) === null, 'bad trailer must fail closed');
	// Restore the node and confirm the database still verifies.
	db.pager.writeExact(decoded.offset, raw);
	assert(nodeIO.load(decoded) !== null, 'restored node must load again');
	assert(db.verify().ok, 'verify ok after checksum test');
	closeAndRemove(db, file);
}

// 6. Scheduled maintenance: gc + health alerts + coalescing schedule.
{
	const { db, file } = fresh('nbu-maintenance');
	db.root.a = Buffer.alloc(4096, 1);
	db.root.b = Buffer.alloc(4096, 2);
	delete db.root.b;
	db.waitForIdle();
	// The alert fires while the deleted bytes are still unreachable;
	// after gc they are adopted, so the check must come first.
	const low = db.checkStorageHealth({ unreachableAlertBytes: 1, unreachableAlertFraction: 0 });
	assert(low.alerts.some(alert => alert.code === 'UNREACHABLE_ABOVE_THRESHOLD'),
		'a 1-byte threshold must raise the unreachable alert');
	const result = db.maintenanceGc({ reason: 'test' });
	assert(result.ok === true, `maintenance gc must succeed, got ${JSON.stringify(result.gc)}`);
	assert(result.health.alerts.length === 0, `no alerts expected, got ${JSON.stringify(result.health.alerts)}`);
	// Coalescing is a synchronous property: the second schedule while
	// one is pending is dropped. The pending run itself is a timer and
	// cannot be awaited here (this test is synchronous by runner law),
	// so it is given a silent logger and its flag is cleared — its
	// firing is covered by the maintenance_gc CLI smoke test instead.
	const silentLogger = { log() {}, error() {} };
	assert(db.scheduleMaintenanceGc({ reason: 'test', delayMs: 50, logger: silentLogger }) === true, 'first schedule must be accepted');
	assert(db.scheduleMaintenanceGc({ reason: 'test', delayMs: 50, logger: silentLogger }) === false, 'second schedule must coalesce');
	db._maintenanceGcScheduled = false;
	const admin = db.admin.storage({ unreachableAlertBytes: 1, unreachableAlertFraction: 0 });
	assert(admin.alerts.length > 0, 'admin storage surface must surface alerts');
	closeAndRemove(db, file);
}

// 7. Production vacuum procedure: dry-run refuses without the
// server-stopped attestation; with it, a full run on a scratch
// database swaps in the candidate and keeps the archive.
{
	const { db, file } = fresh('nbu-vacuum');
	for (let i = 0; i < 20; i++) db.root[`post-${i}`] = `body-${i}-`.repeat(200);
	db.close();
	let refused = false;
	try {
		runProductionVacuum({ livePath: file, dryRun: true });
	} catch (error) {
		refused = error && error.code === 'AWTSMOOS_DB_PRODUCTION_VACUUM_REFUSED';
	}
	assert(refused, 'procedure must refuse without serverStopped attestation');
	const workDir = path.join(path.dirname(file), 'nbu-vacuum-work');
	fs.mkdirSync(workDir, { recursive: true });
	const dry = runProductionVacuum({ livePath: file, dryRun: true, serverStopped: true, workDir });
	assert(dry.ok === true, 'dry run must succeed');
	assert(dry.gates.exclusiveOwnershipProven === true, 'dry run must prove exclusive ownership');
	const full = runProductionVacuum({
		livePath: file,
		serverStopped: true,
		workDir,
		gates: { apiMatrixPassed: true, apiMatrixEvidence: 'scratch test — no live API' }
	});
	assert(full.ok === true, `full procedure must succeed, got ${JSON.stringify(full.error || full.gates)}`);
	assert(fs.existsSync(full.archiveKeptAt), 'archived original must be kept');
	assert(fs.existsSync(full.rollbackKeptAt), 'renamed original must be kept at the rollback path');
	const reopened = new AwtsmoosDB(file, { readOnly: true });
	reopened.open();
	assert(reopened.root['post-7'] === 'body-7-'.repeat(200), 'swapped file must hold the data');
	assert(reopened.verify().ok, 'swapped file must verify');
	reopened.close();
	fs.rmSync(workDir, { recursive: true, force: true });
	TempDbPath.remove(file);
}

console.log('B"H never_builds_up_test PASS');
