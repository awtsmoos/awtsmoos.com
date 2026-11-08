// B"H
/**
 * @module BulkImportTenThousandTest
 * Nov 8 instant pass: the 10,000-post verification bar, run LOCALLY
 * against a temp store (no staging server exists). This is the largest
 * verifiable test: the REAL job machinery end to end — real staged
 * intake (loadStagedPosts), real runJob with the background prepass,
 * real per-post validate/write, real packed mirror into temp files,
 * real receipts, real cancel, real resume to 10,000/10,000.
 *
 * What is STUBBED (stated honestly): the native AwtsmoosDB backend
 * ($i.db) is a Map — the real DosDB write cost is not measured here,
 * so posts/sec below is an UPPER bound for the machinery, not a
 * production throughput claim. The packed mirror IS real (JSONL files
 * under the temp root). Production verification on the live store is
 * still owed (needs a staging server / test DB).
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const JOB_STORE = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-10k-jobstore-'));
process.env.AWTSMOOS_IMPORT_JOB_STORE = JOB_STORE;
// /tmp is only 512 MB: every temp root this file makes is removed when
// its test ends, and the job store goes at file teardown.
test.after(() => {
	try { fs.rmSync(JOB_STORE, { recursive: true, force: true }); } catch (_) { /* ignore */ }
});

const { buildJob } = require('../jobFactory.js');
const { summarizeReceipts, donePostIdsFromReceipts } = require('../jobReceipts.js');
const { mirrorPostBulk } = require('../../../packed/socialPackedMirrorBulk.js');

const POST_COUNT = 10000;
const HEICHEL = 'ikar';
const SERIES = 'e2e-series';
const UPLOAD_ID = 'e2e10kupload01';

/** A Map-backed $i.db: same async interface the import path uses. */
function makeDb(root) {
	const store = new Map();
	return {
		store,
		db: {
			directory: root,
			root,
			write: async (p, v) => { store.set(p, v); },
			get: async (p) => {
				if (!store.has(p)) {
					// Faithful to the real DosDB: a missing path throws
					// "Path does not exist" (code PATH_NOT_FOUND), which
					// callers like ensureRootSeriesExists rely on.
					throw Object.assign(new Error('Path does not exist: ' + p), { code: 'PATH_NOT_FOUND' });
				}
				return store.get(p);
			}
		}
	};
}

/** Compose the real route mixins into one routes object. */
function makeRoutes($i) {
	const routes = Object.assign({},
		require('../stageMixin.js'),
		require('../liveHashMixin.js'),
		require('../nativeWriteMixin.js'),
		require('../aliasMixin.js'),
		require('../backlinksMixin.js'),
		require('../seriesAddsMixin.js'),
		require('../seriesPrateemMixin.js'),
		require('../runJobMixin.js')
	);
	routes.$i = $i;
	// Packed-mirror fallback used by runJobBatch when a batch flush throws.
	routes.writeOnePostBulk = ($i2, post) => mirrorPostBulk({ $i: $i2, post });
	return routes;
}

/** Build a staged 10,000-post set on disk (extracted shape, as after tar -xzf). */
function buildStagedSet(root) {
	const dest = path.join(root, 'socialPacked', 'bulk-stage', UPLOAD_ID, 'files');
	fs.mkdirSync(dest, { recursive: true });
	const entries = [];
	for (let n = 0; n < POST_COUNT; n++) {
		const postId = 'e2e-post-' + String(n).padStart(5, '0');
		const file = 'post-' + String(n).padStart(5, '0') + '.json';
		const post = {
			postId, heichelId: HEICHEL, seriesId: SERIES,
			title: 'E2E post ' + n,
			body: 'Body text for end-to-end post number ' + n + '. ' + 'x'.repeat(200),
			commentator: 'E2E Tester'
		};
		fs.writeFileSync(path.join(dest, file), JSON.stringify(post));
		entries.push({ file, postId, heichelId: HEICHEL });
	}
	fs.writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify({
		files: entries, totalPosts: POST_COUNT, totalBytes: 0
	}));
	return dest;
}

function countNativePosts(store) {
	let n = 0;
	for (const key of store.keys()) {
		if (key.startsWith('/social/heichelos/' + HEICHEL + '/posts/')) n++;
	}
	return n;
}

test('10,000 staged posts run to a receipt-verified 10,000/10,000', { timeout: 300000 }, async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-10k-db-'));
	t.after(() => { try { fs.rmSync(root, { recursive: true, force: true }); } catch (_) { /* ignore */ } });
	const { store, db } = makeDb(root);
	const $i = { db };
	const routes = makeRoutes($i);
	buildStagedSet(root);

	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);
	assert.equal(loaded.error, undefined, 'staged set must load: ' + JSON.stringify(loaded.error));
	assert.equal(loaded.entries.length, POST_COUNT);

	const job = buildJob({
		dryRun: false, heichelId: HEICHEL, isAdmin: true,
		jobAliasId: 'e2e-tester', jobAliasName: 'E2E Tester',
		posts: loaded.entries, skipLiveCheck: false,
		source: loaded.source, stagedDir: loaded.dest, uploadId: UPLOAD_ID,
		caller: { identity: 'e2e', isAdmin: true }, timeBudgetMs: 600000
	});
	const t0 = Date.now();
	let firstWriteMs = null;
	const poller = setInterval(() => {
		if (firstWriteMs === null && job.postsDone > 0) firstWriteMs = Date.now() - t0;
	}, 5);
	await routes.runJob($i, job);
	clearInterval(poller);
	const totalMs = Date.now() - t0;
	if (firstWriteMs === null) firstWriteMs = totalMs;

	assert.equal(job.status, 'done', 'job must finish done, errors: ' + JSON.stringify(job.errors.slice(0, 3)));
	assert.equal(job.wrote, POST_COUNT, 'all 10,000 posts written, failed=' + job.failed);
	assert.equal(job.failed, 0);
	assert.equal(job.postsDone, POST_COUNT);
	const summary = summarizeReceipts($i, job.id);
	assert.equal(summary.wrote, POST_COUNT, 'receipts must show 10,000 wrote');
	assert.equal(summary.failed, 0);
	assert.equal(countNativePosts(store), POST_COUNT, 'native store must hold exactly 10,000 posts');
	// The packed mirror wrote real files under the temp root.
	const packedDir = path.join(root, 'socialPacked');
	const packedFiles = fs.readdirSync(packedDir).filter(n => n.endsWith('.awtsdb') || n.endsWith('.jsonl'));
	assert.ok(packedFiles.length > 0, 'packed mirror must have written files, saw: ' + fs.readdirSync(packedDir).join(','));

	console.log(JSON.stringify({
		tenThousand: {
			totalMs, firstWriteMs,
			postsPerSecond: Math.round(POST_COUNT / (totalMs / 1000)),
			wrote: job.wrote, failed: job.failed,
			receiptsWrote: summary.wrote,
			nativePosts: countNativePosts(store),
			packedFiles
		}
	}, null, 2));
	// The first write must land promptly — the prepass must not gate it.
	assert.ok(firstWriteMs < 5000, 'first write must land within 5 s (prepass is background), took ' + firstWriteMs + ' ms');
});

test('a slow prepass never gates the first write', { timeout: 120000 }, async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-10k-db2-'));
	t.after(() => { try { fs.rmSync(root, { recursive: true, force: true }); } catch (_) { /* ignore */ } });
	const { store, db } = makeDb(root);
	const $i = { db };
	const routes = makeRoutes($i);
	buildStagedSet(root);
	// A builder that takes 5 seconds for the whole set.
	const realBuilder = routes.buildLiveHashCacheForPostsAsync.bind(routes);
	routes.buildLiveHashCacheForPostsAsync = async ($i2, heichelId, ids) => {
		await new Promise(r => setTimeout(r, 5000));
		return realBuilder($i2, heichelId, ids);
	};
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);
	const entries = loaded.entries.slice(0, 200);
	const job = buildJob({
		dryRun: false, heichelId: HEICHEL, isAdmin: true,
		jobAliasId: 'e2e-tester', jobAliasName: 'E2E Tester',
		posts: entries, skipLiveCheck: false,
		source: loaded.source, stagedDir: loaded.dest, uploadId: UPLOAD_ID,
		caller: { identity: 'e2e', isAdmin: true }, timeBudgetMs: 600000
	});
	const t0 = Date.now();
	let firstWriteMs = null;
	const poller = setInterval(() => {
		if (firstWriteMs === null && job.postsDone > 0) firstWriteMs = Date.now() - t0;
	}, 5);
	await routes.runJob($i, job);
	clearInterval(poller);
	assert.equal(job.status, 'done');
	assert.equal(job.wrote, 200);
	assert.ok(firstWriteMs !== null && firstWriteMs < 5000,
		'first write must land while the 5 s prepass is still running, took ' + firstWriteMs + ' ms');
	console.log(JSON.stringify({ slowPrepass: { firstWriteMs, wrote: job.wrote } }));
});

test('cancel mid-run, then resume to exactly 10,000/10,000 with no duplicates', { timeout: 300000 }, async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-10k-db3-'));
	t.after(() => { try { fs.rmSync(root, { recursive: true, force: true }); } catch (_) { /* ignore */ } });
	const { store, db } = makeDb(root);
	const $i = { db };
	const routes = makeRoutes($i);
	buildStagedSet(root);
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);

	const job1 = buildJob({
		dryRun: false, heichelId: HEICHEL, isAdmin: true,
		jobAliasId: 'e2e-tester', jobAliasName: 'E2E Tester',
		posts: loaded.entries, skipLiveCheck: false,
		source: loaded.source, stagedDir: loaded.dest, uploadId: UPLOAD_ID,
		caller: { identity: 'e2e', isAdmin: true }, timeBudgetMs: 600000
	});
	const cancelWatcher = setInterval(() => {
		if (job1.postsDone >= 2000) job1.cancelRequested = true;
	}, 5);
	await routes.runJob($i, job1);
	clearInterval(cancelWatcher);
	assert.equal(job1.status, 'cancelled', 'first attempt must cancel cleanly');
	assert.ok(job1.postsDone >= 2000 && job1.postsDone < POST_COUNT,
		'cancel must land mid-run, postsDone=' + job1.postsDone);
	const wroteFirst = job1.wrote;
	assert.equal(job1.failed, 0);

	// Resume: a new attempt under the same lineage, same staged entries.
	const loaded2 = await routes.loadStagedPosts($i, UPLOAD_ID);
	const job2 = buildJob({
		dryRun: false, heichelId: HEICHEL, isAdmin: true,
		jobAliasId: 'e2e-tester', jobAliasName: 'E2E Tester',
		posts: loaded2.entries, skipLiveCheck: false,
		source: loaded2.source, stagedDir: loaded2.dest, uploadId: UPLOAD_ID,
		resumeOf: job1.id, attempt: 1,
		caller: { identity: 'e2e', isAdmin: true }, timeBudgetMs: 600000
	});
	await routes.runJob($i, job2);
	assert.equal(job2.status, 'done', 'resume must finish done, errors: ' + JSON.stringify(job2.errors.slice(0, 3)));
	assert.equal(job2.failed, 0);
	// Lineage receipts: first attempt's wrote + resume's wrote + resume's skipped.
	const summary = summarizeReceipts($i, job1.id);
	assert.equal(summary.wrote, POST_COUNT, 'lineage receipts must show 10,000 wrote total');
	assert.equal(summary.skipped, wroteFirst, 'resume must skip exactly the posts the first attempt wrote');
	assert.equal(summary.failed, 0);
	assert.equal(countNativePosts(store), POST_COUNT, 'native store must hold exactly 10,000 posts (no duplicates)');
	const done = donePostIdsFromReceipts($i, job1.id);
	assert.equal(done.size, POST_COUNT);
	console.log(JSON.stringify({
		resume: { wroteFirst, resumeWrote: job2.wrote, resumeSkipped: job2.skipped, lineageWrote: summary.wrote, lineageSkipped: summary.skipped }
	}, null, 2));
});
