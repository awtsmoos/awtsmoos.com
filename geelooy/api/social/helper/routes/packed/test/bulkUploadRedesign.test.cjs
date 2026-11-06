// B"H
/**
 * @module BulkUploadRedesignTests
 * Bulk-upload redesign (Nov 6, 2026): job-store separation + receipts,
 * held jobs, staged admission, search-store tolerance, watchdog sweep,
 * bulk-update jobs, and series upserts. All fixtures use tmp dirs;
 * nothing touches the production corpus or the live job store.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
	resolveJobStoreRoot,
	resetJobStoreProbeForTest
} = require('../jobStorePaths.js');
const {
	appendReceipt,
	summarizeReceipts,
	readReceiptsPage,
	donePostIdsFromReceipts,
	failedReceipts
} = require('../jobReceipts.js');
const { jobStateShape } = require('../jobStateShape.js');
const {
	saveJobState,
	saveJobStateDetailed,
	loadJobState
} = require('../jobStatePersistence.js');
const { inspectAdmission, isStagedJob } = require('../importLaneAdmission.js');
const {
	scheduleImportJob,
	maybeReleaseHeld,
	heldJobSnapshot,
	resetImportLanesForTest
} = require('../importLaneScheduler.js');
const { mirrorPostRecords, searchStorePresent } = require('../../../packed/socialPackedMirrorBulk.js');
const { sweepStaleDiskJobs } = require('../jobWatchdog.js');
const { normalizeSeriesInput, applySeriesFields } = require('../seriesUpsertMixin.js');
const updateJobMixin = require('../updateJobMixin.js');

function tmpdir(prefix) {
	// NOTE: os.tmpdir() is a 512 MB tmpfs here, so fixtures live under
	// ~/workspace (the big disk) — the held-job test needs real free space.
	const base = path.join(os.homedir(), 'workspace', '.bulk-test-tmp');
	fs.mkdirSync(base, { recursive: true });
	return fs.mkdtempSync(path.join(base, prefix));
}
function fixture() {
	const directory = tmpdir('awt-bulk-');
	return { $i: { db: { directory } }, directory, cleanup: () => fs.rmSync(directory, { recursive: true, force: true }) };
}
function jobFixture() {
	const f = fixture();
	const job = {
		id: 'postimport_test_' + Math.random().toString(36).slice(2, 8),
		status: 'queued',
		spec: { heichelId: 'ikar', posts: [], source: 'inline', aliasId: 'ikar-import' },
		totalPosts: 0, postsDone: 0, wrote: 0, updated: 0, skipped: 0, failed: 0,
		errors: [], doneHashes: {}, createdAt: Date.now(), updatedAt: Date.now()
	};
	return { ...f, job };
}

// --- §3.3 job-store separation -------------------------------------------
test('job store resolves to the env override, and to the legacy dir for test roots', () => {
	const f = fixture();
	try {
		const store = tmpdir('awt-jobstore-');
		const prev = process.env.AWTSMOOS_IMPORT_JOB_STORE;
		process.env.AWTSMOOS_IMPORT_JOB_STORE = store;
		resetJobStoreProbeForTest();
		try {
			const resolved = resolveJobStoreRoot(f.$i);
			assert.equal(resolved.root, store);
			assert.equal(resolved.degraded, false);
		} finally {
			if (prev === undefined) delete process.env.AWTSMOOS_IMPORT_JOB_STORE;
			else process.env.AWTSMOOS_IMPORT_JOB_STORE = prev;
			resetJobStoreProbeForTest();
			fs.rmSync(store, { recursive: true, force: true });
		}
		const legacy = resolveJobStoreRoot(f.$i);
		assert.equal(legacy.root, path.join(f.directory, 'socialPacked', 'post-import-jobs'));
		assert.equal(legacy.degraded, false);
	} finally {
		f.cleanup();
	}
});

test('state shape is constant-size: no donePostIds, errors truncated, manifest ref kept', () => {
	const job = {
		id: 'x', status: 'running',
		spec: { heichelId: 'ikar', aliasId: 'ikar-import', source: 'upload:abc', stagedDir: '/tmp/stage', uploadId: 'abc' },
		doneHashes: { p1: 'h1', p2: 'h2' },
		errors: Array.from({ length: 80 }, (_, i) => ({ message: 'e' + i })),
		_watchdogTimer: setInterval(() => {}, 1000),
		postsDone: 2
	};
	const shape = jobStateShape(job);
	clearInterval(job._watchdogTimer);
	assert.equal('donePostIds' in shape, false);
	assert.equal(shape.donePostIdsCount, 2);
	assert.equal(shape.errors.length, 50);
	assert.equal(shape.stagedDir, '/tmp/stage');
	assert.equal(shape.uploadId, 'abc');
	assert.equal(JSON.stringify(shape).includes('_watchdogTimer'), false);
});

test('saveJobStateDetailed persists and loadJobState reads back, with the cause on failure', () => {
	const { $i, job, cleanup } = jobFixture();
	try {
		const saved = saveJobStateDetailed($i, job);
		assert.equal(saved.ok, true);
		// A live job stays queued on load; the restart-durability flip to
		// interrupted (pinned by jobRestartDurability.test.cjs) only fires
		// for disk-active states with NO live job in this process.
		require('../jobStore.js').setJob(job);
		const loaded = loadJobState($i, job.id);
		assert.equal(loaded.status, 'queued');
		assert.equal(loaded.donePostIds, undefined);
		const bad = saveJobStateDetailed($i, { id: 'bad id with spaces!' });
		assert.equal(bad.ok, false);
		assert.ok(bad.persistError && bad.persistError.message);
	} finally {
		cleanup();
	}
});

test('legacy states stay readable after the store move (primary first, legacy second)', () => {
	const f = fixture();
	try {
		const legacyDir = path.join(f.directory, 'socialPacked', 'post-import-jobs');
		fs.mkdirSync(legacyDir, { recursive: true });
		const id = 'postimport_legacy_1';
		fs.writeFileSync(path.join(legacyDir, id + '.json'), JSON.stringify({ id, status: 'done', postsDone: 5, createdAt: 1, updatedAt: 1 }));
		const loaded = loadJobState(f.$i, id);
		assert.equal(loaded.status, 'done');
		assert.equal(loaded.postsDone, 5);
	} finally {
		f.cleanup();
	}
});

// --- §3.3 receipts ---------------------------------------------------------
test('receipts append, summarize, paginate, and resolve done/failed sets', () => {
	const { $i, job, cleanup } = jobFixture();
	try {
		assert.equal(appendReceipt($i, job, { postId: 'p1', hash: 'h1', status: 'wrote' }), true);
		assert.equal(appendReceipt($i, job, { postId: 'p2', hash: 'h2', status: 'skipped' }), true);
		assert.equal(appendReceipt($i, job, { postId: 'p3', hash: 'h3', status: 'failed', error: 'boom' }), true);
		assert.equal(appendReceipt($i, job, { postId: 'p4', hash: 'h4', status: 'updated' }), true);
		const summary = summarizeReceipts($i, job.id);
		assert.deepEqual(
			{ wrote: summary.wrote, updated: summary.updated, skipped: summary.skipped, failed: summary.failed, total: summary.total },
			{ wrote: 1, updated: 1, skipped: 1, failed: 1, total: 4 }
		);
		assert.deepEqual(summary.failedPostIds, ['p3']);
		assert.equal(summary.failedErrors.p3, 'boom');
		const page = readReceiptsPage($i, job.id, 2, 2);
		assert.equal(page.total, 4);
		assert.equal(page.receipts.length, 2);
		assert.equal(page.receipts[0].postId, 'p3');
		assert.deepEqual([...donePostIdsFromReceipts($i, job.id)].sort(), ['p1', 'p2', 'p4']);
		assert.deepEqual(failedReceipts($i, job.id).map(r => r.postId), ['p3']);
	} finally {
		cleanup();
	}
});

// --- §3.4 admission + held jobs --------------------------------------------
test('staged jobs are exempt from the memory caps; inline jobs are not', () => {
	const staged = { id: 's1', spec: { source: 'upload:abc', posts: [{ file: 'a.json' }] } };
	assert.equal(isStagedJob(staged), true);
	const admitted = inspectAdmission(staged, [], new Map());
	assert.equal(admitted.staged, true);
	assert.equal(admitted.error, undefined);
	const inline = { id: 'i1', spec: { source: 'inline', posts: [{ postId: 'p1' }] } };
	assert.equal(isStagedJob(inline), false);
	assert.equal(inspectAdmission(inline, [], new Map()).error, undefined);
});

test('a job is held (not refused) below the data floor and auto-starts when space returns', async () => {
	const f = fixture();
	resetImportLanesForTest();
	const prevFloor = process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;
	process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = '1000000';
	const job = {
		id: 'postimport_held_1',
		status: 'queued',
		spec: { heichelId: 'ikar', posts: [{ postId: 'p1', seriesId: 's1' }], source: 'inline', aliasId: 'ikar-import' },
		totalPosts: 1, postsDone: 0, wrote: 0, updated: 0, skipped: 0, failed: 0,
		errors: [], doneHashes: {}, createdAt: Date.now(), updatedAt: Date.now()
	};
	try {
		let ran = false;
		const admission = scheduleImportJob(f.$i, job, async () => { ran = true; job.status = 'done'; });
		assert.equal(admission.held, true);
		assert.equal(admission.status, 'held');
		assert.equal(admission.holdReason, 'IMPORT_STORAGE_LOW');
		assert.equal(job.status, 'held');
		assert.equal(heldJobSnapshot().length, 1);
		assert.equal(loadJobState(f.$i, job.id).status, 'held');
		assert.equal(ran, false);
		delete process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;
		const released = maybeReleaseHeld();
		assert.equal(released, 1);
		assert.equal(heldJobSnapshot().length, 0);
		for (let tries = 0; tries < 200 && !ran; tries++) await new Promise(resolve => setImmediate(resolve));
		assert.equal(ran, true);
	} finally {
		if (prevFloor === undefined) delete process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;
		else process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = prevFloor;
		resetImportLanesForTest();
		f.cleanup();
	}
});

// --- search-store tolerance (Nov 6 deletion order) --------------------------
test('mirror records skip the search shard when its store is absent, and keep it when present', () => {
	const f = fixture();
	try {
		const post = { postId: 'p1', heichelId: 'ikar', seriesId: 's1', aliasId: 'a1', title: 'T', sections: [{ text: 'x' }] };
		assert.equal(searchStorePresent(f.$i), false);
		const without = mirrorPostRecords({ $i: f.$i, post });
		assert.equal(without.some(r => r.shard === 'search'), false);
		assert.equal(without.some(r => r.shard === 'core'), true);
		assert.equal(without.some(r => r.shard === 'allPosts'), true);
		const packedDir = path.join(f.directory, 'socialPacked');
		fs.mkdirSync(packedDir, { recursive: true });
		fs.writeFileSync(path.join(packedDir, 'social.search.awtsdb'), '');
		assert.equal(searchStorePresent(f.$i), true);
		const withSearch = mirrorPostRecords({ $i: f.$i, post });
		assert.equal(withSearch.filter(r => r.shard === 'search').length, 3);
	} finally {
		f.cleanup();
	}
});

// --- §3.6 watchdog sweep ----------------------------------------------------
test('sweepStaleDiskJobs durably flips a 10-minute-stale disk job to interrupted', async () => {
	const f = fixture();
	try {
		const id = 'postimport_stale_1';
		const old = Date.now() - 11 * 60 * 1000;
		assert.equal(saveJobState(f.$i, { id, status: 'running', postsDone: 3, spec: { heichelId: 'ikar' }, errors: [], createdAt: old, updatedAt: old }), true);
		const flipped = await sweepStaleDiskJobs(f.$i);
		assert.deepEqual(flipped, [id]);
		const loaded = loadJobState(f.$i, id);
		assert.equal(loaded.status, 'interrupted');
		assert.ok(loaded.interruptedAt > 0);
		const fresh = await sweepStaleDiskJobs(f.$i);
		assert.deepEqual(fresh, []);
	} finally {
		f.cleanup();
	}
});

// --- §3.5 bulk update as a job ----------------------------------------------
test('runUpdateJob applies per-update receipts with the same semantics as posts/update', async () => {
	const f = fixture();
	try {
		const calls = [];
		const fakeThis = {
			async updateOnePost(heichelId, u, opts) {
				calls.push(u.postId);
				if (u.postId === 'bad') return { postId: 'bad', ok: false, error: 'WRITE_FAILED', message: 'nope' };
				if (u.postId === 'same') return { postId: 'same', ok: true, noop: true, changed: [] };
				return { postId: u.postId, ok: true, changed: ['title'] };
			}
		};
		const job = {
			id: 'postimport_updatejob_1',
			status: 'queued', kind: 'update', dryRun: false, isAdmin: true, caller: null,
			spec: { heichelId: 'ikar', source: 'inline', stagedDir: null, updatesFile: null, verify: false, updates: [
				{ seriesId: 's1', postId: 'p1', set: { title: 'New' } },
				{ seriesId: 's1', postId: 'same', set: { title: 'Same' } },
				{ seriesId: 's1', postId: 'bad', set: { title: 'Bad' } }
			] },
			totalPosts: 3, postsDone: 0, wrote: 0, updated: 0, skipped: 0, failed: 0,
			errors: [], doneHashes: {}, createdAt: Date.now(), updatedAt: Date.now()
		};
		await updateJobMixin.runUpdateJob.call(fakeThis, f.$i, job);
		assert.equal(job.status, 'done');
		assert.equal(job.updated, 1);
		assert.equal(job.skipped, 1);
		assert.equal(job.failed, 1);
		assert.deepEqual(calls, ['p1', 'same', 'bad']);
		const summary = summarizeReceipts(f.$i, job.id);
		assert.equal(summary.updated, 1);
		assert.equal(summary.skipped, 1);
		assert.equal(summary.failed, 1);
		assert.deepEqual(summary.failedPostIds, ['bad']);
	} finally {
		f.cleanup();
	}
});

// --- §3.5 series upsert ------------------------------------------------------
test('normalizeSeriesInput accepts set-shaped and flat series.json', () => {
	assert.deepEqual(normalizeSeriesInput({ seriesId: 's1', set: { title: 'T' } }), { seriesId: 's1', set: { title: 'T' }, expectedVersion: undefined });
	const flat = normalizeSeriesInput({ seriesId: 's1', title: 'T', description: 'D' });
	assert.equal(flat.set.title, 'T');
	assert.equal(flat.set.description, 'D');
	assert.equal(normalizeSeriesInput({ set: {} }), null);
});

test('applySeriesFields versions upserts and rejects stale writers and identity changes', async () => {
	const store = new Map();
	const $i = {
		db: {
			async get(p) {
				if (!store.has(p)) { const e = new Error('Path does not exist: ' + p); e.code = 'PATH_NOT_FOUND'; throw e; }
				return store.get(p);
			},
			async write(p, v) { store.set(p, JSON.parse(JSON.stringify(v))); },
			async syncKeyInObj(p, k) {
				const obj = store.get(p) || {};
				obj[k] = true;
				store.set(p, obj);
			}
		}
	};
	const created = await applySeriesFields($i, 'ikar', { seriesId: 's1', set: { title: 'First' } }, { caller: { identity: 'asdf', isAdmin: true } });
	assert.equal(created.version, 1);
	assert.equal(created.created, true);
	assert.equal(created.prateem.name, 'First');
	const conflict = await applySeriesFields($i, 'ikar', { seriesId: 's1', set: { title: 'Stale' }, expectedVersion: 99 }, { caller: { identity: 'asdf', isAdmin: true } });
	assert.equal(conflict.error, 'VERSION_CONFLICT');
	const forbidden = await applySeriesFields($i, 'ikar', { seriesId: 's1', set: { id: 'other' } }, { caller: { identity: 'asdf', isAdmin: true } });
	assert.equal(forbidden.error, 'FORBIDDEN_FIELD');
	const updated = await applySeriesFields($i, 'ikar', { seriesId: 's1', set: { title: 'Second' }, expectedVersion: 1 }, { caller: { identity: 'asdf', isAdmin: true } });
	assert.equal(updated.version, 2);
	assert.equal(updated.prateem.name, 'Second');
});
