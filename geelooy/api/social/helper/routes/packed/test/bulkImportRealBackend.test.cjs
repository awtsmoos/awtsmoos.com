// B"H
/**
 * @module BulkImportRealBackendTest
 * Nov 8 verification (Coby: "did u verify the bulk import, and test
 * delete and edit"): the bulk import + delete/edit/series operations
 * run end to end against the REAL DosDB backend in a temp directory —
 * real file-per-record native writes, real packed JSONL mirror, real
 * receipts — NOT the Map stub of bulkImportTenThousand.test.cjs.
 *
 * What this proves (measured on this VM):
 * - 10,000 staged posts run to a receipt-verified 10,000/10,000 on the
 *   real backend (~12-21 s wall, first write ~50 ms, 0 failed).
 * - Cancel mid-run + resume reaches exactly 10,000 with no duplicates.
 * - Post update (inline route) lands in the native store and the mirror.
 * - Post remove deletes BOTH native records (heichel + series path) and
 *   writes packed tombstones both shards; listings filter the tombstone.
 * - Series upsert creates + edits a series (version bumps).
 * - Bulk update job updates posts and verifies.
 * - Series delete route: gates hold, the compiled task list covers every
 *   post (tracking + comment hierarchy + heichel-level record), and
 *   applying the tasks removes the series and all its posts.
 *
 * Honest limits (stated, not hidden):
 * - This is a temp store, not the live production store. Live-store
 *   verification still needs a staging server / test DB.
 * - The series-delete task list is applied here by a minimal test-side
 *   applier; the production job runner applies the same ops. Task
 *   execution by the production runner is not driven in this harness.
 * - Resume is correct but slower than a fresh run (~30 s vs ~12 s for
 *   10k here): the live-hash prepass over the populated store plus the
 *   per-post native probes. No duplicates, exact counts.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const JOB_STORE = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-real-jobstore-'));
process.env.AWTSMOOS_IMPORT_JOB_STORE = JOB_STORE;
// The scheduler holds jobs when the data volume is under the 8 GiB free
// floor; /tmp is a 512 MB tmpfs, so disable the floor for these tests
// (the hold itself is covered by importLaneStorageAdmission.test.cjs).
process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = '0';
// Every temp root is tracked here and removed at file teardown as well
// as per-test: a background series-registration write can land a few
// small metadata files after a test's own cleanup runs, so the file-level
// pass is the backstop that keeps /tmp clean.
const TEMP_ROOTS = new Set();
function trackTempRoot(root) {
	TEMP_ROOTS.add(root);
	return root;
}
function removeTempRoot(root) {
	try { fs.rmSync(root, { recursive: true, force: true }); } catch (_) { /* ignore */ }
	TEMP_ROOTS.delete(root);
}
test.after(() => {
	for (const root of [...TEMP_ROOTS]) removeTempRoot(root);
	try { fs.rmSync(JOB_STORE, { recursive: true, force: true }); } catch (_) { /* ignore */ }
});

const DosDB = require('../../../../../../../ayzarim/DosDB/index.js');
const { buildJob } = require('../jobFactory.js');
const { summarizeReceipts, donePostIdsFromReceipts } = require('../jobReceipts.js');
const { mirrorPostBulk } = require('../../../packed/socialPackedMirrorBulk.js');

const HEICHEL = 'ikar';

/** Compose the real route mixins into one routes object (admin auth stubbed). */
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
	routes.checkAuth = () => null; // falsy => admin in authorizeJobRoute
	routes.writeOnePostBulk = ($i2, post) => mirrorPostBulk({ $i: $i2, post });
	return routes;
}

/** Build a staged post set on disk (extracted shape, as after tar -xzf). */
function buildStagedSet(root, uploadId, series, count, prefix) {
	const dest = path.join(root, 'socialPacked', 'bulk-stage', uploadId, 'files');
	fs.mkdirSync(dest, { recursive: true });
	const entries = [];
	for (let n = 0; n < count; n++) {
		const postId = prefix + '-post-' + String(n).padStart(5, '0');
		const file = 'post-' + String(n).padStart(5, '0') + '.json';
		fs.writeFileSync(path.join(dest, file), JSON.stringify({
			postId, heichelId: HEICHEL, seriesId: series,
			title: 'Real post ' + n, body: 'Body text for real-backend post number ' + n + '. ' + 'x'.repeat(200),
			commentator: 'Real Tester'
		}));
		entries.push({ file, postId, heichelId: HEICHEL });
	}
	fs.writeFileSync(path.join(dest, 'manifest.json'), JSON.stringify({ files: entries, totalPosts: count, totalBytes: 0 }));
	return dest;
}

function runImportJob(routes, $i, loaded, uploadId, series, opts = {}) {
	const job = buildJob({
		dryRun: false, heichelId: HEICHEL, isAdmin: true,
		jobAliasId: 'real-tester', jobAliasName: 'Real Tester',
		posts: loaded.entries, skipLiveCheck: false,
		source: loaded.source, stagedDir: loaded.dest, uploadId,
		caller: { identity: 'e2e', isAdmin: true }, timeBudgetMs: 600000,
		...opts
	});
	return job;
}

function countNativeFiles(root, heichel, series) {
	let seriesCount = 0, heichelCount = 0;
	const sp = path.join(root, 'social', 'heichelos', heichel, 'series', series, 'posts');
	const hp = path.join(root, 'social', 'heichelos', heichel, 'posts');
	if (fs.existsSync(sp)) seriesCount = fs.readdirSync(sp).filter(f => f.endsWith('.awtsmoosJSON')).length;
	if (fs.existsSync(hp)) heichelCount = fs.readdirSync(hp).filter(f => f.endsWith('.awtsmoosJSON')).length;
	return { seriesCount, heichelCount };
}

// Minimal task applier (test-side only): the production job runner
// applies these same ops (DELETE_PATH / DELETE_ENTRY / REMOVE_FROM_ARRAY).
// Applying them here proves the compiled task list actually deletes
// everything it claims to.
async function applyTasks(db, tasks) {
	for (const t of tasks) {
		const p = t.params || {};
		if (t.operation === 'DELETE_PATH') {
			await db.delete(p.path);
		} else if (t.operation === 'DELETE_ENTRY') {
			const obj = await db.get(p.path);
			if (obj && typeof obj === 'object' && !Array.isArray(obj) && p.key in obj) {
				delete obj[p.key];
				await db.write(p.path, obj);
			}
		} else if (t.operation === 'REMOVE_FROM_ARRAY') {
			const arr = await db.get(p.path);
			if (Array.isArray(arr)) {
				const val = p.conditions && p.conditions.exact && p.conditions.exact.selfEquals;
				const next = arr.filter(v => v !== val);
				if (next.length !== arr.length) {
					if (next.length === 0 && p.options && p.options.deleteSelfIfEmpty) await db.delete(p.path);
					else await db.write(p.path, next);
				}
			}
		}
	}
}

test('10,000 staged posts run to a receipt-verified 10,000/10,000 on the REAL DosDB backend', { timeout: 300000 }, async (t) => {
	const root = trackTempRoot(fs.mkdtempSync(path.join(os.tmpdir(), 'awt-real-db-')));
	t.after(() => removeTempRoot(root));
	const db = new DosDB(root);
	const $i = { db };
	const routes = makeRoutes($i);
	const UPLOAD_ID = 'real10kupload01';
	const SERIES = 'real-10k-series';
	buildStagedSet(root, UPLOAD_ID, SERIES, 10000, 'real10k');
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);
	assert.equal(loaded.error, undefined, 'staged set must load: ' + JSON.stringify(loaded.error));
	assert.equal(loaded.entries.length, 10000);

	const job = runImportJob(routes, $i, loaded, UPLOAD_ID, SERIES);
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
	assert.equal(job.wrote, 10000, 'all 10,000 posts written, failed=' + job.failed);
	assert.equal(job.failed, 0);
	assert.equal(job.postsDone, 10000);
	const summary = summarizeReceipts($i, job.id);
	assert.equal(summary.wrote, 10000, 'receipts must show 10,000 wrote');
	assert.equal(summary.failed, 0);
	const native = countNativeFiles(root, HEICHEL, SERIES);
	assert.equal(native.seriesCount, 10000, 'series-path native store must hold exactly 10,000 posts');
	assert.equal(native.heichelCount, 10000, 'heichel-path native store must hold exactly 10,000 posts');
	const packedDir = path.join(root, 'socialPacked');
	const packedFiles = fs.readdirSync(packedDir).filter(n => n.endsWith('.awtsdb') || n.endsWith('.jsonl'));
	assert.ok(packedFiles.length > 0, 'packed mirror must have written files, saw: ' + fs.readdirSync(packedDir).join(','));

	console.log(JSON.stringify({
		realTenThousand: {
			totalMs, firstWriteMs,
			postsPerSecond: Math.round(10000 / (totalMs / 1000)),
			wrote: job.wrote, failed: job.failed,
			receiptsWrote: summary.wrote,
			nativeSeries: native.seriesCount, nativeHeichel: native.heichelCount,
			packedFiles
		}
	}, null, 2));
	assert.ok(firstWriteMs < 5000, 'first write must land within 5 s (prepass is background), took ' + firstWriteMs + ' ms');
});

test('cancel mid-run, then resume to exactly 10,000/10,000 with no duplicates on the REAL backend', { timeout: 300000 }, async (t) => {
	const root = trackTempRoot(fs.mkdtempSync(path.join(os.tmpdir(), 'awt-real-db2-')));
	t.after(() => removeTempRoot(root));
	const db = new DosDB(root);
	const $i = { db };
	const routes = makeRoutes($i);
	const UPLOAD_ID = 'realresume01';
	const SERIES = 'real-resume-series';
	buildStagedSet(root, UPLOAD_ID, SERIES, 10000, 'realres');
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);

	const job1 = runImportJob(routes, $i, loaded, UPLOAD_ID, SERIES);
	const cancelWatcher = setInterval(() => {
		if (job1.postsDone >= 2000) job1.cancelRequested = true;
	}, 5);
	await routes.runJob($i, job1);
	clearInterval(cancelWatcher);
	assert.equal(job1.status, 'cancelled', 'first attempt must cancel cleanly');
	assert.ok(job1.postsDone >= 2000 && job1.postsDone < 10000,
		'cancel must land mid-run, postsDone=' + job1.postsDone);
	const wroteFirst = job1.wrote;
	assert.equal(job1.failed, 0);

	const loaded2 = await routes.loadStagedPosts($i, UPLOAD_ID);
	const job2 = runImportJob(routes, $i, loaded2, UPLOAD_ID, SERIES, { resumeOf: job1.id, attempt: 1 });
	await routes.runJob($i, job2);
	assert.equal(job2.status, 'done', 'resume must finish done, errors: ' + JSON.stringify(job2.errors.slice(0, 3)));
	assert.equal(job2.failed, 0);
	const summary = summarizeReceipts($i, job1.id);
	assert.equal(summary.wrote, 10000, 'lineage receipts must show 10,000 wrote total');
	assert.equal(summary.skipped, wroteFirst, 'resume must skip exactly the posts the first attempt wrote');
	assert.equal(summary.failed, 0);
	const done = donePostIdsFromReceipts($i, job1.id);
	assert.equal(done.size, 10000);
	const native = countNativeFiles(root, HEICHEL, SERIES);
	assert.equal(native.seriesCount, 10000, 'no duplicates in series-path store');
	assert.equal(native.heichelCount, 10000, 'no duplicates in heichel-path store');
	console.log(JSON.stringify({
		realResume: { wroteFirst, resumeWrote: job2.wrote, resumeSkipped: job2.skipped, lineageWrote: summary.wrote, lineageSkipped: summary.skipped }
	}, null, 2));
});

test('post update lands in the native store and the packed mirror', { timeout: 120000 }, async (t) => {
	const root = trackTempRoot(fs.mkdtempSync(path.join(os.tmpdir(), 'awt-real-db3-')));
	t.after(() => removeTempRoot(root));
	const db = new DosDB(root);
	const $i = { db, request: { method: 'POST' }, headers: {}, body: {}, $_POST: {} };
	const routes = makeRoutes($i);
	const UPLOAD_ID = 'realupd01';
	const SERIES = 'real-upd-series';
	buildStagedSet(root, UPLOAD_ID, SERIES, 3, 'upd');
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);
	const job = runImportJob(routes, $i, loaded, UPLOAD_ID, SERIES);
	await routes.runJob($i, job);
	assert.equal(job.wrote, 3);

	$i.body = {
		heichelId: HEICHEL, verify: true,
		updates: [
			{ seriesId: SERIES, postId: 'upd-post-00000', set: { title: 'EDITED title 0', studyGuide: 'New guide' } },
			{ seriesId: SERIES, postId: 'upd-post-00001', set: { title: 'EDITED title 1' }, unset: ['body'] }
		]
	};
	const upd = await routes.update();
	assert.equal(upd.success.failed, 0, 'update must succeed: ' + JSON.stringify(upd));
	assert.equal(upd.success.ok, 2);
	const p0 = await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/posts/upd-post-00000`);
	assert.equal(p0.title, 'EDITED title 0');
	assert.equal(p0.studyGuide, 'New guide');
	assert.equal(p0.body, 'Body text for real-backend post number 0. ' + 'x'.repeat(200));
	const p1 = await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/posts/upd-post-00001`);
	assert.equal(p1.title, 'EDITED title 1');
	assert.ok(!('body' in p1), 'unset must remove the body field');
	// The packed mirror reflects the update.
	const { readPacked } = require('../../../packed/socialPacked.js');
	const { logicalKey } = require('../../../packed/shardPaths.js');
	const m0 = readPacked({ $i, shard: 'core', key: logicalKey(['posts', HEICHEL, 'upd-post-00000']) });
	const m0v = m0 && m0.value ? m0.value : m0;
	assert.equal(m0v.title, 'EDITED title 0', 'mirror must show the edited title');
});

test('post remove deletes BOTH native records and tombstones the mirror; refused remove leaves the post', { timeout: 120000 }, async (t) => {
	const root = trackTempRoot(fs.mkdtempSync(path.join(os.tmpdir(), 'awt-real-db4-')));
	t.after(() => removeTempRoot(root));
	const db = new DosDB(root);
	const $i = { db, request: { method: 'POST' }, headers: {}, body: {}, $_POST: {} };
	const routes = makeRoutes($i);
	const UPLOAD_ID = 'realrem01';
	const SERIES = 'real-rem-series';
	buildStagedSet(root, UPLOAD_ID, SERIES, 3, 'rem');
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);
	const job = runImportJob(routes, $i, loaded, UPLOAD_ID, SERIES);
	await routes.runJob($i, job);
	assert.equal(job.wrote, 3);

	$i.headers = {
		'x-owner-delete-confirm': 'OWNER_CONFIRMED_DELETE_20261019',
		'x-agent-identity': 'e2e-test', 'x-agent-kind': 'ai', 'x-agent-source': 'bulk-verify'
	};
	$i.body = { heichelId: HEICHEL, postId: 'rem-post-00001' };
	const rem = await routes.remove();
	assert.ok(rem.success, 'remove must succeed: ' + JSON.stringify(rem));
	assert.ok(rem.success.removed.includes('native'), 'heichel-path record must be removed');
	assert.ok(rem.success.removed.includes('native-series'), 'series-path record must be removed (primary read path)');
	assert.ok(rem.success.removed.includes('packed-tombstone'), 'core tombstone must be written');
	assert.ok(rem.success.removed.includes('allposts-tombstone'), 'allPosts tombstone must be written');
	assert.equal(await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/posts/rem-post-00001`), null, 'series-path record must be gone');
	assert.equal(await db.get(`/social/heichelos/${HEICHEL}/posts/rem-post-00001`), null, 'heichel-path record must be gone');
	// The mirror's latest record for the key is the tombstone; listings filter op=del.
	const { readPacked, listPackedRecords } = require('../../../packed/socialPacked.js');
	const { logicalKey } = require('../../../packed/shardPaths.js');
	const m1 = readPacked({ $i, shard: 'core', key: logicalKey(['posts', HEICHEL, 'rem-post-00001']) });
	assert.equal(m1.op, 'del', 'mirror latest record must be the tombstone');
	assert.equal(m1.value, null);
	const allPosts = listPackedRecords({ $i, shard: 'allPosts' });
	const live = allPosts.filter(r => r.op !== 'del' && r.value);
	assert.ok(!live.some(r => r.key && r.key.endsWith('rem-post-00001')), 'removed post must not be live in allPosts');
	assert.ok(live.some(r => r.key && r.key.endsWith('rem-post-00000')), 'sibling post must stay live');
	// Removing a missing post reports existed:false and still tombstones.
	$i.body = { heichelId: HEICHEL, postId: 'rem-post-99999' };
	const remMissing = await routes.remove();
	assert.equal(remMissing.success.existed, false);
	// Without the owner-confirm header the delete is refused and the post stays.
	$i.headers = { 'x-agent-identity': 'e2e-test', 'x-agent-kind': 'ai', 'x-agent-source': 'bulk-verify' };
	$i.body = { heichelId: HEICHEL, postId: 'rem-post-00002' };
	const refused = await routes.remove();
	assert.equal(refused.success, false);
	assert.equal(refused.error, 'DELETE_NEEDS_OWNER_CONFIRM');
	assert.ok(await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/posts/rem-post-00002`), 'refused remove must leave the post');
});

test('series upsert creates and edits a series; bulk update job updates posts', { timeout: 120000 }, async (t) => {
	const root = trackTempRoot(fs.mkdtempSync(path.join(os.tmpdir(), 'awt-real-db5-')));
	t.after(() => removeTempRoot(root));
	const db = new DosDB(root);
	const $i = { db, request: { method: 'POST' }, headers: {}, body: {}, $_POST: {} };
	const routes = makeRoutes($i);
	const SERIES = 'real-series-upd';

	$i.body = { heichelId: HEICHEL, seriesId: SERIES, set: { title: 'First Title', description: 'd1' } };
	const up1 = await routes.seriesUpsert();
	assert.ok(up1.success, 'series create must succeed: ' + JSON.stringify(up1));
	assert.equal(up1.success.created, true);
	assert.equal(up1.success.version, 1);
	const prateem1 = await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/prateem`);
	assert.equal(prateem1.name, 'First Title');
	$i.body = { heichelId: HEICHEL, seriesId: SERIES, set: { title: 'Renamed Title' } };
	const up2 = await routes.seriesUpsert();
	assert.equal(up2.success.created, false);
	assert.equal(up2.success.version, 2);
	const prateem2 = await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/prateem`);
	assert.equal(prateem2.name, 'Renamed Title');

	// Bulk update job over imported posts.
	const UPLOAD_ID = 'realbulkupd01';
	buildStagedSet(root, UPLOAD_ID, SERIES, 3, 'bupd');
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);
	const job = runImportJob(routes, $i, loaded, UPLOAD_ID, SERIES);
	await routes.runJob($i, job);
	assert.equal(job.wrote, 3);
	// Bulk update job over imported posts. The route handler accepts the
	// job (it may report held on this 512 MB tmpfs — the scheduler's
	// disk-floor gate cannot release below floor + 1 GiB here; admission
	// and hold are covered by importLaneStorageAdmission.test.cjs, not
	// here), so the update machinery itself is driven directly to prove
	// the updates land.
	$i.body = {
		heichelId: HEICHEL, verify: true,
		updates: [
			{ seriesId: SERIES, postId: 'bupd-post-00000', set: { title: 'BULK-UPDATED 0' } },
			{ seriesId: SERIES, postId: 'bupd-post-00001', set: { title: 'BULK-UPDATED 1' } }
		]
	};
	const uj = await routes.updateJob();
	assert.ok(uj.success, 'updateJob must accept: ' + JSON.stringify(uj));
	assert.ok(uj.success.jobId, 'updateJob must return a jobId');
	const directJob = buildJob({
		kind: 'update', dryRun: false, heichelId: HEICHEL, isAdmin: true,
		jobAliasId: HEICHEL + '-import', jobAliasName: HEICHEL + ' Import',
		posts: [], skipLiveCheck: false, source: 'inline', stagedDir: null,
		uploadId: null, caller: { identity: 'e2e-tester', isAdmin: true }, timeBudgetMs: 600000
	});
	directJob.spec.updates = [
		{ seriesId: SERIES, postId: 'bupd-post-00000', set: { title: 'BULK-UPDATED 0' } },
		{ seriesId: SERIES, postId: 'bupd-post-00001', set: { title: 'BULK-UPDATED 1' } }
	];
	directJob.spec.verify = true;
	directJob.totalPosts = 2;
	await routes.runUpdateJob($i, directJob);
	assert.equal(directJob.status, 'done', 'bulk update job must finish done, errors: ' + JSON.stringify(directJob.errors.slice(0, 3)));
	assert.equal(directJob.updated, 2);
	assert.equal(directJob.failed, 0);
	const b0 = await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/posts/bupd-post-00000`);
	assert.equal(b0.title, 'BULK-UPDATED 0');
});

test('series delete route: gates hold, task list covers every post, applying the tasks removes the series and all its posts', { timeout: 120000 }, async (t) => {
	const root = trackTempRoot(fs.mkdtempSync(path.join(os.tmpdir(), 'awt-real-db6-')));
	t.after(() => removeTempRoot(root));
	const db = new DosDB(root);
	const $i = { db, request: { method: 'POST' }, headers: {}, body: {}, $_POST: {}, $_DELETE: {}, $_GET: {}, userid: 'e2e-user' };
	const routes = makeRoutes($i);
	const SERIES = 'real-del-series';
	const UPLOAD_ID = 'realserdel01';

	$i.body = { heichelId: HEICHEL, seriesId: SERIES, set: { title: 'Delete Me' } };
	const up = await routes.seriesUpsert();
	assert.ok(up.success, 'series create must succeed: ' + JSON.stringify(up));
	buildStagedSet(root, UPLOAD_ID, SERIES, 3, 'sdel');
	const loaded = await routes.loadStagedPosts($i, UPLOAD_ID);
	const job = runImportJob(routes, $i, loaded, UPLOAD_ID, SERIES);
	await routes.runJob($i, job);
	assert.equal(job.wrote, 3);
	await db.write(`/social/heichelos/${HEICHEL}/editors`, ['editor']);

	const capturedJobs = [];
	$i.createJob = async (j) => { capturedJobs.push(j); return { jobId: 'captured-job-1' }; };
	$i.fetchAwtsmoos = async (url) => {
		if (url.includes('/ownership')) return {};
		if (url.includes('/breadcrumb')) return [{ id: 'root' }];
		throw new Error('unexpected fetch ' + url);
	};
	const { createSeriesMutationRoutes } = require('../../series/mutationRoutes.js');
	const seriesRoutes = createSeriesMutationRoutes({ $i, userid: 'e2e-user' });
	const delHandler = seriesRoutes['/heichelos/:heichel/series/:parentSeriesId/deleteSubSeries/:seriesId'];
	assert.ok(delHandler, 'deleteSubSeries route must exist');

	// Gates: missing alias refused, non-editor refused.
	$i.request = { method: 'DELETE' };
	$i.$_POST = {}; $i.$_DELETE = {};
	const noAlias = await delHandler({ heichel: HEICHEL, parentSeriesId: 'root', seriesId: SERIES });
	assert.equal(noAlias.error.code, 'AUTH_NEEDED');
	$i.$_POST = {}; $i.$_DELETE = { aliasId: 'stranger' };
	const stranger = await delHandler({ heichel: HEICHEL, parentSeriesId: 'root', seriesId: SERIES });
	assert.equal(stranger.error.code, 'NO_AUTH');
	assert.equal(capturedJobs.length, 0, 'refused deletes must not create a job');

	// Authorized delete compiles a complete task list.
	$i.$_POST = {}; $i.$_DELETE = { aliasId: 'editor' };
	const delRes = await delHandler({ heichel: HEICHEL, parentSeriesId: 'root', seriesId: SERIES });
	assert.ok(delRes.success, 'authorized delete must succeed: ' + JSON.stringify(delRes));
	assert.equal(delRes.success.richComments.posts, 3, 'rich cascade must see all 3 posts');
	assert.equal(capturedJobs.length, 1);
	const tasks = capturedJobs[0].tasks;
	assert.ok(tasks.length >= 11, 'task list must cover the series + 3 posts, got ' + tasks.length);
	const ops = {};
	for (const task of tasks) ops[task.operation] = (ops[task.operation] || 0) + 1;
	assert.equal(ops.DELETE_ENTRY, 3, 'one alias-tracking DELETE_ENTRY per post');
	assert.ok((ops.DELETE_PATH || 0) >= 9, 'comment + heichel-level + series DELETE_PATHs, got ' + JSON.stringify(ops));
	const heichelDeletes = tasks.filter(task =>
		task.operation === 'DELETE_PATH' && task.params && typeof task.params.path === 'string' &&
		task.params.path.startsWith(`/social/heichelos/${HEICHEL}/posts/`));
	assert.equal(heichelDeletes.length, 3, 'one heichel-level DELETE_PATH per post');

	// Applying the compiled tasks removes everything.
	await applyTasks(db, tasks);
	assert.equal(await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/prateem`), null, 'prateem must be gone');
	assert.equal(await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/posts`), null, 'series posts index must be gone');
	for (let n = 0; n < 3; n++) {
		const pid = 'sdel-post-' + String(n).padStart(5, '0');
		assert.equal(await db.get(`/social/heichelos/${HEICHEL}/series/${SERIES}/posts/${pid}`), null, 'series-path post ' + pid + ' must be gone');
		assert.equal(await db.get(`/social/heichelos/${HEICHEL}/posts/${pid}`), null, 'heichel-path post ' + pid + ' must be gone');
	}
});
