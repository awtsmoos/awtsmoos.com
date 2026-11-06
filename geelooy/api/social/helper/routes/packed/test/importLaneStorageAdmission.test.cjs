//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importLaneStorageAdmission.test.cjs
 * @description
 * The Awtsmoos lets a scheduler know when the vessel is too narrow before a receipt is born;
 * Awtsmoos.com proves low storage holds the promise durably (visible, auto-starting)
 * instead of refusing it — bulk-upload redesign §3.4.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { jobs } = require('../jobStore.js');
const {
	resetImportLanesForTest,
	scheduleImportJob,
	heldJobSnapshot
} = require('../importLaneScheduler.js');
const { jobStateDir } = require('../jobState.js');

const ORIGINAL_FLOOR = process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;

/** Build one minimal schedulable job whose runner must never begin while held. */
function job() {
	return {
		id: 'postimport_storage_rejected',
		status: 'queued',
		errors: [],
		doneHashes: {},
		spec: {
			heichelId: 'ikar',
			posts: [{ postId: 'storage-rejected', seriesId: 'root' }]
		}
	};
}

test.afterEach(() => {
	resetImportLanesForTest();
	jobs.clear();
	if (ORIGINAL_FLOOR === undefined) delete process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;
	else process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = ORIGINAL_FLOOR;
});

test('low storage holds the job durably instead of rejecting it', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-storage-lane-'));
	const $i = { db: { directory: root } };
	let runnerCalled = false;
	process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = String(1024 * 1024);
	try {
		const candidate = job();
		const result = scheduleImportJob($i, candidate, async () => {
			runnerCalled = true;
		});
		// Bulk-upload redesign §3.4: below the data floor the job is
		// admitted as held (durable, visible, auto-start) — not refused.
		assert.equal(result.held, true);
		assert.equal(result.holdReason, 'IMPORT_STORAGE_LOW');
		assert.equal(result.retryable, true);
		assert.equal(runnerCalled, false);
		assert.equal(candidate.status, 'held');
		assert.equal(jobs.has(candidate.id), true);
		assert.deepEqual(heldJobSnapshot().map(entry => entry.id), [candidate.id]);
		const filename = path.join(jobStateDir($i), candidate.id + '.json');
		assert.equal(fs.existsSync(filename), true);
		const persisted = JSON.parse(fs.readFileSync(filename, 'utf8'));
		assert.equal(persisted.status, 'held');
		assert.equal(persisted.holdReason, 'IMPORT_STORAGE_LOW');
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
