// B"H
/**
 * @module BulkImportFs3SpeedTest
 * Nov 10 speed fix verification (Coby: "2000 per 10 second small" —
 * 2,000 small posts per 10 seconds on the live store, no dead space
 * ever). The Nov 8 real-backend test proved the job machinery on the
 * FILE backend (no family files in its temp root, so the router fell
 * back to .awtsmoosJSON files). This test proves the fix on the REAL
 * production path: the family .fs.awtsdb files are pre-created, so the
 * series-path writes route into the AwtsmoosDB VirtualFs vessels
 * (the 14 GB series file on the live server), the store is seeded
 * (500 posts + 200 updates, so the child-map and free list are
 * live-shaped), and then 2,000 small posts are timed.
 *
 * What this proves:
 * - 2,000 small posts run to a receipt-verified 2,000/2,000 on the FS3
 *   backend, with the measured posts/sec printed (target: 200/s).
 * - The series file grows by ~the new records only (no dead-space
 *   blow-up): growth is bounded and printed.
 * - The series file verifies clean (db.verify() ok) after the run.
 * - A sample post reads back through the public series path.
 *
 * Honest limits (stated, not hidden):
 * - The packed mirror here is JSONL (the test root carries a file
 *   root, so engineFor selects JSONL) — the production mirror writes
 *   into the AwtsmoosDB shards file instead. This test measures the
 *   native FS3 write path; the full production rate (native + shards
 *   mirror) is measured on the live server after deploy, via the
 *   import receipts.
 * - This VM is shared (1.5 CPUs) and timings are noisy; the rate
 *   floor below (50/s) is a regression guard, the 200/s target is
 *   evaluated from the printed measurement.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const JOB_STORE = fs.mkdtempSync(path.join(process.env.HOME, 'workspace', 'awt-fs3-jobstore-'));
process.env.AWTSMOOS_IMPORT_JOB_STORE = JOB_STORE;
process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = '0';
const TEMP_ROOTS = new Set();
function trackTempRoot(root) { TEMP_ROOTS.add(root); return root; }
function removeTempRoot(root) { try { fs.rmSync(root, { recursive: true, force: true }); } catch (_) { TEMP_ROOTS.delete(root); } }
test.after(() => {
	for (const root of [...TEMP_ROOTS]) removeTempRoot(root);
	try { fs.rmSync(JOB_STORE, { recursive: true, force: true }); } catch (_) { /* ignore */ }
});

const DosDB = require('../../../../../../../ayzarim/DosDB/index.js');
const AwtsmoosDB = require('../../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const { buildJob } = require('../jobFactory.js');
const { summarizeReceipts } = require('../jobReceipts.js');

const HEICHEL = 'ikar';

function makeRoutes($i, extraMixins = []) {
	const routes = Object.assign({},
		require('../stageMixin.js'),
		require('../liveHashMixin.js'),
		require('../nativeWriteMixin.js'),
		require('../aliasMixin.js'),
		require('../backlinksMixin.js'),
		require('../seriesAddsMixin.js'),
		require('../seriesPrateemMixin.js'),
		require('../seriesUpsertMixin.js'),
		require('../updateMixin.js'),
		require('../updateJobMixin.js'),
		require('../removeMixin.js'),
		require('../runJobMixin.js'),
		...extraMixins
	);
	routes.$i = $i;
	routes.checkAuthDetailed = () => ({ caller: { identity: 'e2e-tester', isAdmin: true } });
	routes.checkAuth = () => null;
	routes.writeOnePostBulk = ($i2, post) => require('../../../packed/socialPackedMirrorBulk.js').mirrorPostBulk({ $i: $i2, post });
	return routes;
}

function buildStagedSet(root, uploadId, series, count, prefix, bodySize = 200) {
	const dest = path.join(root, 'socialPacked', 'bulk-stage', uploadId, 'files');
	fs.mkdirSync(dest, { recursive: true });
	const entries = [];
	for (let n = 0; n < count; n++) {
		const postId = prefix + '-post-' + String(n).padStart(5, '0');
		const file = 'post-' + String(n).padStart(5, '0') + '.json';
		fs.writeFileSync(path.join(dest, file), JSON.stringify({
			postId, heichelId: HEICHEL, seriesId: series,
			title: 'Speed post ' + n, body: 'Body ' + n + '. ' + 'x'.repeat(bodySize),
			commentator: 'Speed Tester'
		}));
		entries.push({ file, postId, heichelId: HEICHEL });
	}
	fs.writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify({ files: entries, totalPosts: count, totalBytes: 0 }));
	return dest;
}

function runImportJob(routes, $i, loaded, uploadId, opts = {}) {
	const job = buildJob({
		dryRun: false, heichelId: HEICHEL, isAdmin: true,
		jobAliasId: 'speed-tester', jobAliasName: 'Speed Tester',
		posts: loaded.entries, skipLiveCheck: false,
		source: loaded.source, stagedDir: loaded.dest, uploadId,
		caller: { identity: 'e2e', isAdmin: true }, timeBudgetMs: 1800000,
		...opts
	});
	return job;
}

/** Pre-create the heichel family vessels so the router sends series-path writes into FS3. */
function createFamilyFiles(root) {
	const packed = path.join(root, 'socialPacked');
	fs.mkdirSync(packed, { recursive: true });
	for (const family of ['series', 'posts']) {
		const file = path.join(packed, `social.heichel.${HEICHEL}.${family}.fs.awtsdb`);
		const db = new AwtsmoosDB(file, { compression: false, reuseFreedSpace: 'verified' });
		db.open();
		db.close();
	}
	return {
		series: path.join(packed, `social.heichel.${HEICHEL}.series.fs.awtsdb`),
		posts: path.join(packed, `social.heichel.${HEICHEL}.posts.fs.awtsdb`)
	};
}

function inspectStore(file) {
	const db = new AwtsmoosDB(file, { readOnly: true });
	db.open();
	const a = db.allocator;
	const freeList = a.freeList || [];
	let freeBytes = 0;
	for (const r of freeList) freeBytes += r.length;
	const out = {
		physical: fs.statSync(file).size,
		cursor: a.cursor,
		freeRanges: freeList.length,
		freeBytes,
		verify: db.verify()
	};
	db.close();
	return out;
}

test('2,000 small posts on a seeded FS3 store: rate, receipts, flat file, clean verify', { timeout: 1800000 }, async (t) => {
	// Temp under ~/workspace, NOT /tmp: /tmp is a 512 MB tmpfs and an
	// external cleaner wipes its temp dirs mid-run (the first FS3
	// speed-test run lost 547 staged files + the family files to it).
	const root = trackTempRoot(fs.mkdtempSync(path.join(process.env.HOME, 'workspace', 'awt-fs3-db-')));
	t.after(() => removeTempRoot(root));
	const familyFiles = createFamilyFiles(root);
	const db = new DosDB(root);
	const $i = { db };
	const routes = makeRoutes($i);

	// Seed: 500 posts into the seed series, then re-import the same 500
	// with changed bodies (500 updates) to fragment the free list.
	const SEED_SERIES = 'seed-series';
	buildStagedSet(root, 'seed-upload-01', SEED_SERIES, 500, 'seed');
	let loaded = await routes.loadStagedPosts($i, 'seed-upload-01');
	assert.equal(loaded.entries.length, 500);
	let job = runImportJob(routes, $i, loaded, 'seed-upload-01');
	await routes.runJob($i, job);
	assert.equal(job.status, 'done', 'seed job must finish done: ' + JSON.stringify(job.errors.slice(0, 3)));
	assert.equal(job.wrote, 500);
	assert.equal(job.failed, 0);

	// Update pass: rewrite the same 500 postIds with different bodies.
	const seedDest = path.join(root, 'socialPacked', 'bulk-stage', 'seed-upload-01', 'files');
	for (let n = 0; n < 500; n++) {
		const file = path.join(seedDest, 'post-' + String(n).padStart(5, '0') + '.json');
		const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
		doc.body = 'Updated body ' + n + '. ' + 'y'.repeat(300);
		fs.writeFileSync(file, JSON.stringify(doc));
	}
	loaded = await routes.loadStagedPosts($i, 'seed-upload-01');
	job = runImportJob(routes, $i, loaded, 'seed-upload-01');
	await routes.runJob($i, job);
	assert.equal(job.status, 'done', 'seed update job must finish done: ' + JSON.stringify(job.errors.slice(0, 3)));
	assert.equal(job.updated, 500, 'seed update must update 500, wrote=' + job.wrote + ' failed=' + job.failed);
	assert.equal(job.failed, 0);
	const seeded = inspectStore(familyFiles.series);
	console.log(JSON.stringify({ seededSeriesFile: { physical: seeded.physical, cursor: seeded.cursor, freeRanges: seeded.freeRanges, freeBytes: seeded.freeBytes, verifyOk: seeded.verify.ok } }));

	// Timed run: 2,000 small posts into a fresh series.
	const SPEED_SERIES = 'speed-series';
	buildStagedSet(root, 'speed-upload-01', SPEED_SERIES, 2000, 'speed', 200);
	loaded = await routes.loadStagedPosts($i, 'speed-upload-01');
	assert.equal(loaded.entries.length, 2000);
	const before = inspectStore(familyFiles.series);
	job = runImportJob(routes, $i, loaded, 'speed-upload-01');
	const t0 = Date.now();
	await routes.runJob($i, job);
	const totalMs = Date.now() - t0;
	const after = inspectStore(familyFiles.series);
	const summary = summarizeReceipts($i, job.id);
	const postsPerSecond = 2000 / (totalMs / 1000);
	const fileGrowth = after.physical - before.physical;

	assert.equal(job.status, 'done', 'speed job must finish done, errors: ' + JSON.stringify(job.errors.slice(0, 3)));
	assert.equal(job.wrote, 2000, 'all 2,000 posts written, failed=' + job.failed);
	assert.equal(job.failed, 0);
	assert.equal(job.postsDone, 2000);
	assert.equal(summary.wrote, 2000, 'receipts must show 2,000 wrote');
	assert.equal(summary.failed, 0);
	assert.equal(after.verify.ok, true, 'series file must verify clean: ' + JSON.stringify(after.verify.errors || []).slice(0, 500));
	// Read back one post through the public series path.
	const sample = await $i.db.get(`/social/heichelos/${HEICHEL}/series/${SPEED_SERIES}/posts/speed-post-01999`);
	assert.ok(sample && typeof sample === 'object', 'sample post must read back');
	assert.equal(sample.postId, 'speed-post-01999');

	console.log(JSON.stringify({
		fs3Speed: {
			totalMs, postsPerSecond: Math.round(postsPerSecond * 10) / 10,
			targetPostsPerSecond: 200, meetsTarget: postsPerSecond >= 200,
			wrote: job.wrote, failed: job.failed, receiptsWrote: summary.wrote,
			seriesFileBefore: before.physical, seriesFileAfter: after.physical, fileGrowthBytes: fileGrowth,
			freeRangesBefore: before.freeRanges, freeRangesAfter: after.freeRanges,
			freeBytesBefore: before.freeBytes, freeBytesAfter: after.freeBytes,
			verifyOk: after.verify.ok
		}
	}));

	// Regression guard (the 200/s target is evaluated from the printed
	// measurement above, not from this floor — this VM is shared/noisy).
	assert.ok(postsPerSecond >= 50, 'rate must clear 50/s (measured ' + postsPerSecond.toFixed(1) + '/s)');
	assert.ok(fileGrowth < 20 * 1024 * 1024, 'series file growth must stay bounded (grew ' + fileGrowth + ' bytes)');
});
