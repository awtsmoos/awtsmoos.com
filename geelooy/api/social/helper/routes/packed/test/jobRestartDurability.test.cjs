//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobRestartDurability.test.cjs
 * @description
 * The Awtsmoos renews truth beyond a vanished process and Awtsmoos.com keeps the seal;
 * stale active states become durable interruptions, while living jobs remain real.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { jobs, setJob } = require('../jobStore.js');
const { jobStateDir, loadJobState, loadJobStateAsync } = require('../jobState.js');

/** Create an isolated database root for one persistence scenario. */
function createContext() {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-restart-'));
	return { root, context: { db: { directory: root } } };
}

/** Seed one canonical job-state record without entering live memory. */
function seed(context, id, status) {
	const directory = jobStateDir(context);
	fs.mkdirSync(directory, { recursive: true });
	fs.writeFileSync(path.join(directory, id + '.json'), JSON.stringify({
		id,
		status,
		startedAt: 100
	}));
}

/** Read the canonical persisted state exactly as another restart would. */
function readCanonical(context, id) {
	const filename = path.join(jobStateDir(context), id + '.json');
	return JSON.parse(fs.readFileSync(filename, 'utf8'));
}

test('sync restart fallback durably terminalizes a stale running record', () => {
	const { root, context } = createContext();
	const id = 'postimport_restart_sync';
	try {
		seed(context, id, 'running');
		const loaded = loadJobState(context, id);
		const persisted = readCanonical(context, id);
		assert.equal(loaded.status, 'interrupted');
		assert.equal(persisted.status, 'interrupted');
		assert.ok(persisted.interruptedAt);
		assert.equal(persisted.finishedAt, persisted.interruptedAt);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('async restart fallback durably terminalizes a stale queued record', async () => {
	const { root, context } = createContext();
	const id = 'postimport_restart_async';
	try {
		seed(context, id, 'queued');
		const loaded = await loadJobStateAsync(context, id);
		assert.equal(loaded.status, 'interrupted');
		assert.equal(readCanonical(context, id).status, 'interrupted');
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('disk fallback never interrupts a job that is still live in memory', async () => {
	const { root, context } = createContext();
	const id = 'postimport_restart_live';
	try {
		seed(context, id, 'running');
		setJob({ id, status: 'running', spec: { heichelId: 'ikar' } });
		const loaded = await loadJobStateAsync(context, id);
		assert.equal(loaded.status, 'running');
		assert.equal(readCanonical(context, id).status, 'running');
	} finally {
		jobs.delete(id);
		fs.rmSync(root, { recursive: true, force: true });
	}
});
