// B"H

/**
 * @file test/verified_session_pool_reuse_test.js
 * @chapter The Chamber This Hand Freed Needs No Second Court
 * @description
 * Db-phase2 incremental allocator trust (core/allocator/rangeTrust.js):
 *
 *   1. When the verified gate cannot pass (verify sabotaged — the
 *      persisted list is quarantined), a range freed by THIS process is
 *      recorded in the durable pending ledger AND the session pool, and
 *      a later allocation reuses exactly that range with no verify —
 *      while the live body is never touched.
 *   2. Per-range validation at reuse time refuses corrupted candidates:
 *      overlap with a leased (unlinked) body, with the free-list seal
 *      body, with the root anchor body, with the main free list
 *      (double handout), and out-of-bounds ranges. A poisoned session
 *      pool entry is quarantined and allocation falls back to append.
 *   3. Complement shaping no longer drops ranges permanently:
 *      adoptComplement deposits dust (<64 B) and cap overflow into the
 *      deferred spill with telemetry counters.
 *   4. Free-space telemetry reports every pool and the counters.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const Pointer = require('../utils/pointer/crown.js');
const rangeTrust = require('../core/allocator/rangeTrust.js');
const refreshVerifiedComplement = require('../core/allocator/reachableComplement.js');
const adoptComplement = refreshVerifiedComplement.adoptComplement;

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const STORE_OPTS = {
	debug: false, readOnly: false, reuseFreedSpace: 'verified', versions: false,
	virtualFsCompression: true, wal: false, processLockMode: 'exclusive', lockMode: 'exclusive'
};

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-session-pool-'));
let db;

try {
	// ---- 1. Gate-closed session reuse
	db = new AwtsmoosDB(path.join(directory, 'gate.fs.awtsdb'), { ...STORE_OPTS });
	db.open();
	const liveBody = Buffer.from('live-body-must-survive-0123456789');
	const live = db.blob.create(liveBody);
	db.root.liveBlob = live;
	const seed = db.blob.create(Buffer.alloc(400, 3));
	const guard = db.blob.create(Buffer.alloc(64, 4));
	db.root.guardBlob = guard;
	db.blob.delete(seed); // free list (persisted-list stand-in) is non-empty
	const dead = db.blob.create(Buffer.alloc(300, 9)); // created while trusted
	const deadLoc = { offset: dead.offset, length: dead.length };
	assert(db.allocator.freeList.length >= 1, 'fixture free list must be non-empty');

	const realVerify = db.verify.bind(db);
	db.verify = () => ({ ok: false, degraded: false, errors: [{ reason: 'sabotaged' }], free: [] });
	db.allocator._trustedFreeListVersion = -1;
	db.allocator._freeListVersion = (db.allocator._freeListVersion || 0) + 1;

	db.blob.delete(dead); // first gated op: the gate fails here
	const stats1 = db.allocator.freeSpaceStats();
	assert(stats1.session.ranges >= 1, 'gate-blocked free was not recorded in the session pool');
	assert(stats1.pending.ranges >= 1, 'gate-blocked free was not recorded in the pending ledger');
	assert(db.allocator.rejectedFreeList.length >= 1, 'unverifiable persisted list was not quarantined');

	const reused = db.allocator.allocate(300);
	assert(reused.offset === deadLoc.offset, 'allocation did not reuse the session-freed range');
	assert(db.allocator.freeSpaceStats().counters.sessionReused >= 1, 'session reuse was not counted');
	assert(Buffer.compare(db.blob.read(db.root.liveBlob), liveBody) === 0, 'live body was corrupted');
	db.verify = realVerify;
	db.close();
	db = null;

	// ---- 2. Per-range validation refusals
	db = new AwtsmoosDB(path.join(directory, 'valid.fs.awtsdb'), { ...STORE_OPTS });
	db.open();
	const unlinked = db.blob.create(Buffer.alloc(512, 5)); // leased until linked
	let verdict = rangeTrust.validateRangeForReuse(db.allocator, { offset: unlinked.offset, length: 128 });
	assert(verdict.ok === false && verdict.reason === 'overlaps-allocation-lease',
		'candidate overlapping a leased body was not refused');
	db.root.unlinked = unlinked;

	const seed2 = db.blob.create(Buffer.alloc(200, 1));
	const tail2 = db.blob.create(Buffer.alloc(32, 2));
	db.root.tail2 = tail2;
	db.blob.delete(seed2);
	db.waitForIdle();
	if (db.freeListPtrRaw) {
		const seal = Pointer.decode(db.freeListPtrRaw);
		verdict = rangeTrust.validateRangeForReuse(db.allocator, { offset: seal.offset, length: 16 });
		assert(verdict.ok === false && verdict.reason === 'overlaps-seal-body',
			'candidate overlapping the free-list seal body was not refused');
	}
	if (db.rootPtrRaw) {
		const anchor = Pointer.decode(db.rootPtrRaw);
		verdict = rangeTrust.validateRangeForReuse(db.allocator, { offset: anchor.offset, length: 16 });
		assert(verdict.ok === false, 'candidate overlapping the root anchor body was not refused');
	}
	verdict = rangeTrust.validateRangeForReuse(db.allocator,
		{ offset: db.allocator.cursor + 1000, length: 64 });
	assert(verdict.ok === false && verdict.reason === 'out-of-bounds',
		'out-of-bounds candidate was not refused');
	const free0 = db.allocator.freeList[0];
	if (free0) {
		verdict = rangeTrust.validateRangeForReuse(db.allocator,
			{ offset: free0.offset, length: Math.min(32, free0.length) });
		assert(verdict.ok === false && verdict.reason === 'overlaps-free-list',
			'candidate overlapping the free list (double handout) was not refused');
	}

	// Poisoned session pool over a leased body: refuse, append, survive.
	const leased = db.blob.create(Buffer.alloc(256, 7));
	db.allocator._sessionFreeList = [{ offset: leased.offset, length: leased.length }];
	const cursorBefore = db.allocator.cursor;
	const location = db.allocator.allocate(256); // free-list ranges are < 256 here
	assert(location.offset >= cursorBefore, 'poisoned session candidate was handed out');
	assert(db.allocator.rejectedFreeList.some(range => range.reason === 'overlaps-allocation-lease'),
		'poisoned candidate was not quarantined with its reason');
	assert(Buffer.compare(db.blob.read(leased), Buffer.alloc(256, 7)) === 0,
		'leased body was corrupted by the poisoned allocation');
	db.close();
	db = null;

	// ---- 3. adoptComplement deposits drops into the spill
	const fakeAllocator = {
		cursor: 10_000_000,
		_sessionFreeList: [],
		_deferredFreeList: [],
		_freeSpaceCounters: null,
		db: { options: {} },
		depositDeferredRange(range, kind) {
			return rangeTrust.depositDeferred(this, range, kind);
		}
	};
	const withDust = adoptComplement(
		[{ offset: 100, length: 32 }, { offset: 200, length: 500 }, { offset: 1000, length: 800 }],
		fakeAllocator.cursor, fakeAllocator);
	assert(withDust.length === 2, 'dust range must not enter the adopted list');
	assert(fakeAllocator._deferredFreeList.some(r => r.offset === 100 && r.length === 32),
		'dust range was dropped instead of deferred');
	assert(rangeTrust.counters(fakeAllocator).dustDeferred === 1, 'dust deferral was not counted');

	const many = [];
	for (let i = 0; i < 65_600; i++) many.push({ offset: 100 + i * 1000, length: 100 });
	const cursor = 100 + 65_600 * 1000;
	fakeAllocator.cursor = cursor;
	const adopted = adoptComplement(many, cursor, fakeAllocator);
	assert(adopted.length === 65_536, `overflow adoption must cap at 65,536 (got ${adopted.length})`);
	assert(rangeTrust.counters(fakeAllocator).overflowDeferred === 65_600 - 65_536,
		'overflow ranges were dropped instead of deferred');
	assert(fakeAllocator._deferredFreeList.length >= 64, 'deferred spill did not receive the overflow');

	// ---- 4. Telemetry shape
	db = new AwtsmoosDB(path.join(directory, 'tele.fs.awtsdb'), { ...STORE_OPTS });
	db.open();
	const stats = db.allocator.freeSpaceStats();
	for (const key of ['mode', 'reuseState', 'active', 'session', 'deferred', 'pending', 'quarantined', 'counters']) {
		assert(key in stats, `freeSpaceStats is missing ${key}`);
	}
	for (const key of ['sessionReused', 'spillReused', 'dustDeferred', 'overflowDeferred', 'refusedAtReuse']) {
		assert(key in stats.counters, `freeSpaceStats.counters is missing ${key}`);
	}
	assert(db.info().freeSpace.mode === 'verified', 'db.info() does not surface free-space telemetry');
	db.close();
	db = null;
} finally {
	if (db) db.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H verified_session_pool_reuse_test PASS');
