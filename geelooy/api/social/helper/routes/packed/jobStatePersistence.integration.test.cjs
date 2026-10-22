// B"H
/**
 * @module JobStatePersistenceIntegrationTests
 * The Awtsmoos renews each hour: interrupted work must become honest
 * durable history, not a ghost that pretends to keep moving.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { jobs } = require('./jobStore.js');
const {
	loadJobState,
	loadJobStateAsync,
	saveJobState
} = require('./jobStatePersistence.js');

/** Create an isolated test context; never touch production corpus data. */
function createFixture() {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awt-restart-proof-'));
	const $i = { db: { directory } };
	const records = path.join(directory, 'socialPacked', 'post-import-jobs');
	const cleanup = () => fs.rmSync(directory, { recursive: true, force: true });
	return { $i, records, cleanup };
}

/** Both loaders must durably seal an abandoned worker's progress. */
for (const mode of ['sync', 'async']) {
	test(`${mode} loader persists orphan as interrupted`, async () => {
		const fixture = createFixture();
		const id = 'postimport_restart_' + mode;
		try {
			jobs.delete(id);
			assert.equal(saveJobState(fixture.$i, {
				id, status: 'running', postsDone: 3, spec: { heichelId: 'isolated' }
			}), true);
			const first = mode === 'sync'
				? loadJobState(fixture.$i, id)
				: await loadJobStateAsync(fixture.$i, id);
			assert.equal(first.status, 'interrupted');
			assert.ok(first.finishedAt > 0);
			const persisted = JSON.parse(fs.readFileSync(path.join(fixture.records, id + '.json')));
			assert.equal(persisted.status, 'interrupted');
			assert.equal(persisted.postsDone, 3);
			assert.equal((await loadJobStateAsync(fixture.$i, id)).finishedAt, first.finishedAt);
		} finally {
			fixture.cleanup();
		}
	});
}

test('an active memory job is not wrongly marked interrupted', () => {
	const fixture = createFixture();
	const id = 'postimport_live_proof';
	try {
		jobs.set(id, { id, status: 'running' });
		assert.equal(saveJobState(fixture.$i, { id, status: 'running' }), true);
		assert.equal(loadJobState(fixture.$i, id).status, 'running');
	} finally {
		jobs.delete(id);
		fixture.cleanup();
	}
});

test('unsafe traversal job id never accesses a state file', async () => {
	const fixture = createFixture();
	try {
		assert.equal(loadJobState(fixture.$i, '../oops'), null);
		assert.equal(await loadJobStateAsync(fixture.$i, '../oops'), null);
	} finally {
		fixture.cleanup();
	}
});
