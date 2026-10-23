//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file jobCheckpointWriter.test.cjs
 * @description
 * The Awtsmoos renews each instant and Awtsmoos.com records the honest last word;
 * a wandering checkpoint may finish late, yet terminal truth must still be heard.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { checkpointAsync, awaitCheckpoint } = require('../jobCheckpointWriter.js');
const { saveJobState, jobStateDir } = require('../jobState.js');

/** Create a minimal import job whose persisted shape is representative and valid. */
function createJob() {
	return {
		id: 'postimport_checkpoint_fence',
		status: 'running',
		startedAt: Date.now(),
		doneHashes: {},
		errors: [],
		spec: {
			heichelId: 'ikar',
			source: 'checkpoint-regression'
		}
	};
}

test('terminal save waits for an older async checkpoint before writing final truth', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-checkpoint-'));
	const context = { db: { directory: root } };
	const job = createJob();
	const originalWriteFile = fs.promises.writeFile;
	let releaseCheckpoint;
	let checkpointStarted;
	const started = new Promise(resolve => {
		checkpointStarted = resolve;
	});
	const release = new Promise(resolve => {
		releaseCheckpoint = resolve;
	});

	fs.promises.writeFile = async function delayedWrite(filePath, body, ...rest) {
		if (String(filePath).endsWith('.json.ckptmp')) {
			checkpointStarted();
			await release;
		}
		return originalWriteFile.call(this, filePath, body, ...rest);
	};

	try {
		checkpointAsync(context, job);
		await started;
		job.status = 'done';
		const terminalSave = (async () => {
			await awaitCheckpoint(job);
			saveJobState(context, job);
		})();
		releaseCheckpoint();
		await terminalSave;
		const statePath = path.join(jobStateDir(context), job.id + '.json');
		const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
		assert.equal(persisted.status, 'done');
	} finally {
		fs.promises.writeFile = originalWriteFile;
		fs.rmSync(root, { recursive: true, force: true });
	}
});
