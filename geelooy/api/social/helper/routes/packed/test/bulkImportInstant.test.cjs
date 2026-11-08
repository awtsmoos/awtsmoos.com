// B"H
/**
 * @module BulkImportInstantTest
 * Nov 8 instant pass: the bulk import system must be instant for any set
 * of posts. These tests prove the fixes, not the Nov 6 build (which has
 * its own suite in test/bulkUploadRedesign.test.cjs):
 *  - the live-hash prepass runs in the BACKGROUND and never gates the
 *    first write; a worker's fresh value always wins over a stale
 *    prepass value (merge invariant).
 *  - the stage counts chunks with one readdir (not one stat per index
 *    per arrival) and reports the exact received indexes, so a client
 *    resuming after a drop re-sends exactly the missing chunks.
 *  - appendReceipt creates its directory only on ENOENT, not per post.
 *  - receipts reads STREAM (bounded memory) instead of loading the
 *    whole file on every status poll / resume / verify.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const JOB_STORE = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-instant-jobstore-'));
process.env.AWTSMOOS_IMPORT_JOB_STORE = JOB_STORE;
// /tmp is only 512 MB: every temp root this file makes is removed when
// its test ends, and the job store goes at file teardown.
test.after(() => {
	try { fs.rmSync(JOB_STORE, { recursive: true, force: true }); } catch (_) { /* ignore */ }
});

const { startLiveHashPrep, prepareLiveHashes } = require('../jobLiveHashPrep.js');
const jobReceipts = require('../jobReceipts.js');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function makeJob(postCount) {
	return {
		id: 'postimport_instant_' + Date.now() + '_' + Math.random().toString(16).slice(2),
		status: 'running',
		spec: {
			heichelId: 'ikar',
			posts: Array.from({ length: postCount }, (_, i) => ({ postId: 'post-' + i }))
		},
		errors: []
	};
}

// -- live-hash prepass -------------------------------------------------------

test('background prepass returns immediately and fills while workers run', async () => {
	const job = makeJob(600);
	const routes = {
		buildLiveHashCacheForPostsAsync: async ($i, heichelId, ids) => {
			await sleep(60);
			return new Map(ids.map(id => [id, 'hash-' + id]));
		}
	};
	const started = startLiveHashPrep(routes, {}, job);
	assert.equal(started.liveHashes.size, 0, 'prepass must not block the caller');
	// A worker writes post-0 while the prepass is still filling.
	started.liveHashes.set('post-0', 'worker-hash');
	const result = await started.done;
	assert.equal(result.abandoned, false);
	assert.equal(result.size, 600);
	assert.equal(started.liveHashes.get('post-0'), 'worker-hash', 'worker value must win over a stale prepass value');
	assert.equal(started.liveHashes.get('post-599'), 'hash-post-599');
	assert.ok(job.cacheBuildMs >= 100, 'prepass took real time in the background, not on the caller');
});

test('awaited prepareLiveHashes still returns the full cache (compat)', async () => {
	const job = makeJob(10);
	const routes = {
		buildLiveHashCacheForPostsAsync: async ($i, heichelId, ids) => new Map(ids.map(id => [id, 'hash-' + id]))
	};
	const cache = await prepareLiveHashes(routes, {}, job);
	assert.equal(cache.size, 10);
	assert.equal(cache.get('post-3'), 'hash-post-3');
});

test('prepass abandons on its deadline instead of gating the job', async () => {
	const job = makeJob(600);
	const routes = {
		buildLiveHashCacheForPostsAsync: async ($i, heichelId, ids) => {
			await sleep(200);
			return new Map(ids.map(id => [id, 'hash-' + id]));
		}
	};
	// 3 slices x 200 ms with a 150 ms deadline: the first slice lands,
	// then the deadline check abandons the rest.
	const started = startLiveHashPrep(routes, {}, job, { deadlineMs: 150 });
	const result = await started.done;
	assert.equal(result.abandoned, true, 'a prepass slower than its deadline must abandon');
	assert.ok(result.size < 600, 'abandoned prepass is partial, workers proceed on native probes');
	assert.equal(result.size, 250, 'exactly one slice landed before the deadline');
});

// -- stage chunk counting + received indexes ---------------------------------

test('stage reports exact received indexes; a hole is filled, never skipped', async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-instant-stage-'));
	t.after(() => { try { fs.rmSync(root, { recursive: true, force: true }); } catch (_) { /* ignore */ } });
	const $i = { db: { directory: root }, request: { method: 'POST' }, $_POST: {}, $_GET: {} };
	const stage = require('../bulkPublishAllRoutesStage.js');
	const ctx = { $i, checkAuth: () => null, stageStatus: stage.stageStatus };
	const uploadId = 'testupload01';
	const chunks = ['chunk-zero-data', 'chunk-one-data', 'chunk-two-data', 'chunk-three-data'];
	const b64 = s => Buffer.from(s, 'utf8').toString('base64');
	const sha = s => crypto.createHash('sha256').update(Buffer.from(s, 'utf8')).digest('hex');

	async function sendChunk(index) {
		$i.request.method = 'POST';
		$i.$_POST = { uploadId, chunkIndex: index, totalChunks: 4, data: b64(chunks[index]), chunkSha256: sha(chunks[index]) };
		$i.body = $i.$_POST;
		return stage.stage.call(ctx);
	}
	// Out of order, with a hole at chunk 1.
	let r = await sendChunk(0);
	assert.equal(r.success.receivedChunks, 1);
	r = await sendChunk(2);
	assert.equal(r.success.receivedChunks, 2);
	r = await sendChunk(3);
	assert.equal(r.success.receivedChunks, 3);
	assert.equal(r.success.complete, false);
	// Progress reports the EXACT indexes, not a 0..count assumption.
	$i.request.method = 'GET';
	$i.$_POST = { uploadId };
	$i.$_GET = { uploadId };
	const status = await stage.stage.call(ctx);
	assert.deepEqual(status.success.receivedIndexes, [0, 2, 3]);
	assert.equal(status.success.complete, false);
	// A chunk with a wrong claimed hash is rejected without failing the upload.
	$i.request.method = 'POST';
	$i.$_POST = { uploadId, chunkIndex: 1, totalChunks: 4, data: b64(chunks[1]), chunkSha256: 'deadbeef' };
	$i.body = $i.$_POST;
	const bad = await stage.stage.call(ctx);
	assert.equal(bad.error, 'CHUNK_HASH_MISMATCH');
	// Fill the hole: the upload assembles.
	r = await sendChunk(1);
	assert.equal(r.success.receivedChunks, 4);
	assert.equal(r.success.complete, true);
	const tarPath = path.join(root, 'socialPacked', 'bulk-stage', uploadId, 'upload.tar.gz');
	assert.equal(fs.readFileSync(tarPath, 'utf8'), chunks.join(''));
	// Re-sent chunk with a matching hash is a no-op.
	r = await sendChunk(1);
	assert.equal(r.success.receivedChunks, 4);
	assert.equal(r.success.complete, true);
});

// -- receipts: append + streaming reads ---------------------------------------

test('appendReceipt creates its directory once, not per post', (t) => {
	const fsReal = require('node:fs');
	const dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-instant-db-'));
	t.after(() => { try { fs.rmSync(dbDir, { recursive: true, force: true }); } catch (_) { /* ignore */ } });
	const $i = { db: { directory: dbDir } };
	const job = { id: 'postimport_mkdir_' + Date.now(), status: 'running' };
	// Warm up: first append creates the store root + receipts file.
	assert.equal(jobReceipts.appendReceipt($i, job, { postId: 'warmup', hash: 'h', status: 'wrote' }), true);
	let mkdirCalls = 0;
	const orig = fsReal.mkdirSync;
	fsReal.mkdirSync = (...args) => { mkdirCalls++; return orig(...args); };
	try {
		for (let n = 0; n < 100; n++) {
			assert.equal(jobReceipts.appendReceipt($i, job, { postId: 'p' + n, hash: 'h' + n, status: 'wrote' }), true);
		}
	} finally {
		fsReal.mkdirSync = orig;
	}
	// After warm-up the directory exists, so no mkdir should run at all.
	assert.equal(mkdirCalls, 0, 'appendReceipt must not mkdirSync on every append');
	const lines = jobReceipts.readReceipts($i, job.id);
	assert.equal(lines.length, 101);
	assert.equal(lines[100].postId, 'p99');
});

test('receipts reads stream: page, summary, and done-set stay correct at 100k lines', (t) => {
	const dbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-instant-db2-'));
	t.after(() => { try { fs.rmSync(dbDir, { recursive: true, force: true }); } catch (_) { /* ignore */ } });
	const $i = { db: { directory: dbDir } };
	const jobId = 'postimport_stream_' + Date.now();
	const file = path.join(process.env.AWTSMOOS_IMPORT_JOB_STORE, jobId + '.receipts.jsonl');
	const fd = fs.openSync(file, 'w');
	try {
		for (let b = 0; b < 10; b++) {
			let s = '';
			for (let i = 0; i < 10000; i++) {
				const n = b * 10000 + i;
				const status = n % 10 === 9 ? 'failed' : 'wrote';
				s += JSON.stringify({ postId: 'p' + n, hash: 'h' + n, status, error: status === 'failed' ? 'boom' : undefined, at: 1234567890123 }) + '\n';
			}
			fs.writeSync(fd, s);
		}
		// A torn final line (no newline, invalid JSON) must be skipped.
		fs.writeSync(fd, '{"postId":"torn');
	} finally {
		fs.closeSync(fd);
	}
	const page = jobReceipts.readReceiptsPage($i, jobId, 500, 100);
	assert.equal(page.total, 100000);
	assert.equal(page.pages, 1000);
	assert.equal(page.receipts.length, 100);
	assert.equal(page.receipts[0].postId, 'p49900');
	assert.equal(page.receipts[99].postId, 'p49999');
	const summary = jobReceipts.summarizeReceipts($i, jobId);
	assert.equal(summary.total, 100000);
	assert.equal(summary.wrote, 90000);
	assert.equal(summary.failed, 10000);
	assert.equal(summary.failedPostIds.length, 100);
	const done = jobReceipts.donePostIdsFromReceipts($i, jobId);
	assert.equal(done.size, 90000);
	assert.ok(done.has('p0'));
	assert.ok(!done.has('p9'));
	let streamed = 0;
	let first = null;
	let last = null;
	for (const r of jobReceipts.streamReceipts($i, jobId)) {
		if (streamed === 0) first = r;
		last = r;
		streamed++;
	}
	assert.equal(streamed, 100000);
	assert.equal(first.postId, 'p0');
	assert.equal(last.postId, 'p99999');
});
