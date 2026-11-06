// B"H
/**
 * @module StatusMixinIntegrationTests
 * The Awtsmoos holds each living step and every recorded echo in light;
 * the reader sees honest status, bounded in size and guarded from wrong sight.
 *
 * Bulk-upload redesign §3.3/§3.6: per-post outcomes live in the receipts
 * file, not in the state. Status reports the state counter plus the
 * receipts summary; the capped donePostIds list comes from the receipts'
 * first page, never from a linear list in the state file.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { status, list } = require('./statusMixin.js');
const { jobs } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');
const { appendReceipt } = require('./jobReceipts.js');

function fixture() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-status-proof-'));
	const $i = { db: { directory }, headers: {}, request: { method: 'GET' }, $_GET: {} };
	const route = { $i, checkAuth: () => null };
	return { directory, route, cleanup: () => fs.rmSync(directory, { recursive: true, force: true }) };
}

function job(id, state = 'done') {
	return {
		id, status: state, spec: { heichelId: 'proof' },
		postsDone: 3, wrote: 3, totalPosts: 3,
		createdAt: 100, startedAt: 200, finishedAt: 300,
		errors: [], doneHashes: { first: 'a', second: 'b', third: 'c' }
	};
}

test('disk fallback reports terminal job with no live registry entry', async () => {
	const { route, cleanup } = fixture();
	const record = job('status_disk_proof');
	try {
		assert.equal(saveJobState(route.$i, record), true);
		route.$i.$_GET.jobId = record.id;
		const response = await status.call(route);
		assert.equal(response.success.status, 'done');
		assert.equal(response.success.live, false);
		assert.equal(response.success.postsDone, 3);
		assert.equal(response.success.donePostIdsCount, 3);
	} finally {
		cleanup();
	}
});

test('live registry view wins over stale on-disk state', async () => {
	const { route, cleanup } = fixture();
	const record = job('status_live_proof', 'running');
	try {
		assert.equal(saveJobState(route.$i, { ...record, status: 'queued' }), true);
		jobs.set(record.id, record);
		route.$i.$_GET.job = record.id;
		const response = await status.call(route);
		assert.equal(response.success.status, 'running');
		assert.equal(response.success.live, true);
	} finally {
		jobs.delete(record.id);
		cleanup();
	}
});

test('done count stays accurate while per-post IDs come from receipts', async () => {
	const { route, cleanup } = fixture();
	const record = job('status_cap_proof');
	record.doneHashes = Object.fromEntries(Array.from({ length: 1205 }, (_, index) => [`post_${index}`, 'yes']));
	try {
		jobs.set(record.id, record);
		// Two durable receipts exist; the state counter still says 1205.
		assert.equal(appendReceipt(route.$i, record, { postId: 'post_0', hash: 'yes', status: 'wrote' }), true);
		assert.equal(appendReceipt(route.$i, record, { postId: 'post_1', hash: 'yes', status: 'wrote' }), true);
		route.$i.$_GET.id = record.id;
		const response = await status.call(route);
		// Count is the state counter (1205), not the receipts total (2).
		assert.equal(response.success.donePostIdsCount, 1205);
		// The capped list is the receipts' first page, not a linear state list.
		assert.deepEqual(response.success.donePostIds, ['post_0', 'post_1']);
		assert.equal(response.success.donePostIdsTruncated, true);
		// Receipts summary + URL are the durable per-post truth.
		assert.equal(response.success.receipts.total, 2);
		assert.equal(response.success.receipts.wrote, 2);
		assert.ok(response.success.receiptsUrl.includes('postimport') || response.success.receiptsUrl.includes('status_cap_proof'));
	} finally {
		jobs.delete(record.id);
		cleanup();
	}
});

test('missing job returns a bounded missing-result response', async () => {
	const { route, cleanup } = fixture();
	try {
		route.$i.$_GET.jobId = 'not_a_real_job_record';
		const response = await status.call(route);
		assert.equal(response.error, 'JOB_NOT_FOUND');
	} finally {
		cleanup();
	}
});

test('wrong HTTP method and authentication denial block status and list', async () => {
	const { route, cleanup } = fixture();
	try {
		route.$i.request.method = 'POST';
		assert.ok((await status.call(route)).error);
		assert.ok((await list.call(route)).error);
		route.$i.request.method = 'GET';
		route.checkAuth = () => ({ error: 'NO_LOGIN' });
		assert.equal((await status.call(route)).error, 'NO_LOGIN');
		assert.equal((await list.call(route)).error, 'NO_LOGIN');
	} finally {
		cleanup();
	}
});
