// B"H
/**
 * @module ImportLaneAdmissionTests
 * The Awtsmoos carries each job only when the ledger can carry its weight;
 * a failed persistent write must never claim admission through the gate.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const { inspectAdmission } = require('./importLaneAdmission.js');
const { scheduleImportJob, importLaneSnapshot, resetImportLanesForTest } = require('./importLaneScheduler.js');
const { getJob, jobs } = require('./jobStore.js');

function candidate(id, payload = [{ seriesId: 's1' }]) {
	return { id, status: 'queued', spec: { heichelId: 'fixture', posts: payload }, errors: [] };
}

test('a full queue is rejected before accepting a job', () => {
	const waiting = Array.from({ length: 24 }, (_, index) => ({ job: candidate('prior' + index), bytes: 9 }));
	assert.equal(inspectAdmission(candidate('new'), waiting, new Map()).error, 'IMPORT_QUEUE_FULL');
});

test('duplicate queued ID is rejected', () => {
	assert.equal(inspectAdmission(candidate('same'), [{ job: candidate('same'), bytes: 10 }], new Map()).error, 'IMPORT_DUPLICATE_JOB');
});

test('unserializable import payload is rejected', () => {
	const loop = {};
	loop.parent = loop;
	assert.equal(inspectAdmission(candidate('bad', [loop]), [], new Map()).error, 'IMPORT_INVALID_PAYLOAD');
});

test('resident memory budget is enforced', () => {
	const waiting = [{ job: candidate('prior'), bytes: 96 * 1024 * 1024 }];
	assert.equal(inspectAdmission(candidate('large'), waiting, new Map()).error, 'IMPORT_QUEUE_MEMORY_LIMIT');
});

test('persistence failure returns error without registering or running a job', () => {
	resetImportLanesForTest();
	const badContext = { db: { directory: '/dev/null' } };
	const rejected = candidate('cannot_save_queued');
	let started = false;
	const result = scheduleImportJob(badContext, rejected, async () => { started = true; });
	assert.equal(result.error, 'IMPORT_PERSIST_FAILED');
	assert.equal(getJob(rejected.id), null);
	assert.equal(importLaneSnapshot().queued, 0);
	assert.equal(importLaneSnapshot().active, 0);
	assert.equal(started, false);
	resetImportLanesForTest();
});

test('successful admission persists queued state before runner starts', async () => {
	resetImportLanesForTest();
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-admission-proof-'));
	const $i = { db: { directory } };
	const accepted = candidate('durable_queued_proof');
	let entered;
	const gate = new Promise(resolve => { entered = resolve; });
	try {
		const receipt = scheduleImportJob($i, accepted, async () => { await gate; accepted.status = 'done'; });
		assert.equal(receipt.queued, true);
		const file = path.join(directory, 'socialPacked', 'post-import-jobs', accepted.id + '.json');
		assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).status, 'queued');
	} finally {
		entered();
		jobs.delete(accepted.id);
		resetImportLanesForTest();
		await new Promise(resolve => setImmediate(resolve));
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
