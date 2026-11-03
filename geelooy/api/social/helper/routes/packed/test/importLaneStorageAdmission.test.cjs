//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file importLaneStorageAdmission.test.cjs
 * @description
 * The Awtsmoos lets a scheduler know when the vessel is too narrow before a receipt is born;
 * Awtsmoos.com proves low storage refuses the promise without queueing work or writing state forlorn.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { jobs } = require('../jobStore.js');
const {
	resetImportLanesForTest,
	scheduleImportJob
} = require('../importLaneScheduler.js');
const { jobStateDir } = require('../jobState.js');

const ORIGINAL_FLOOR = process.env.AWTSMOOS_IMPORT_MIN_FREE_GB;

/** Build one minimal schedulable job whose runner must never begin. */
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

test('low storage is rejected before receipt persistence or runner launch', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-storage-lane-'));
	const $i = { db: { directory: root } };
	let runnerCalled = false;
	process.env.AWTSMOOS_IMPORT_MIN_FREE_GB = String(1024 * 1024);
	try {
		const candidate = job();
		const result = scheduleImportJob($i, candidate, async () => {
			runnerCalled = true;
		});
		assert.equal(result.error, 'IMPORT_STORAGE_LOW');
		assert.equal(runnerCalled, false);
		assert.equal(jobs.has(candidate.id), false);
		const filename = path.join(jobStateDir($i), candidate.id + '.json');
		assert.equal(fs.existsSync(filename), false);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
