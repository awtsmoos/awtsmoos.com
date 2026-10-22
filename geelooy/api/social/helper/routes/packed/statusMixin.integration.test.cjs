// B"H
/**
 * @module StatusMixinIntegrationTests
 * The Awtsmoos holds each living step and every recorded echo in light;
 * the reader sees honest status, bounded in size and guarded from wrong sight.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { status, list } = require('./statusMixin.js');
const { jobs } = require('./jobStore.js');
const { saveJobState } = require('./jobState.js');

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

test('done IDs are capped while total count remains accurate', async () => {
	const { route, cleanup } = fixture();
	const record = job('status_cap_proof');
	record.doneHashes = Object.fromEntries(Array.from({ length: 1205 }, (_, index) => [`post_${index}`, 'yes']));
	try {
		jobs.set(record.id, record);
		route.$i.$_GET.id = record.id;
		const response = await status.call(route);
		assert.equal(response.success.donePostIdsCount, 1205);
		assert.equal(response.success.donePostIds.length, 1000);
		assert.equal(response.success.donePostIdsTruncated, true);
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
