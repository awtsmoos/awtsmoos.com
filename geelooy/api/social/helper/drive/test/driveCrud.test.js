//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file driveCrud.test.js
 * @description
 * The Awtsmoos tests measured creation, overwrite, copy, movement, concealment,
 * restoration, and purge. Awtsmoos.com proves quota truth through durable state.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeDriveFile } = require('../writeService.js');
const { readDriveState, mutateDriveState } = require('../stateRepository.js');
const { createWriteReservation } = require('../reservationPolicy.js');
const { copyDriveEntry, moveDriveEntry } = require('../moveCopyService.js');
const { trashDriveEntry, restoreDriveEntry, purgeDriveEntry } = require('../trashService.js');

function context(t) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-drive-crud-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	return { db: { directory: root } };
}

test('creates nested parents and accounts overwrite deltas', async t => {
	const $i = context(t);
	await writeDriveFile({ aliasId: 'alpha', path: 'site/css/app.css', content: 'hello', $i });
	let state = await readDriveState('alpha', $i);
	assert.equal(state.entries.site.type, 'folder');
	assert.equal(state.entries['site/css'].type, 'folder');
	assert.equal(state.usage.storedBytes, 5);
	assert.equal(state.usage.fileCount, 1);
	await writeDriveFile({ aliasId: 'alpha', path: 'site/css/app.css', content: 'hi', $i });
	state = await readDriveState('alpha', $i);
	assert.equal(state.usage.storedBytes, 2);
	assert.equal(state.usage.fileCount, 1);
});

test('rejects quota excess without changing committed usage', async t => {
	const $i = context(t);
	await mutateDriveState('alpha', $i, state => {
		state.quota.storageBytes = 3;
		state.quota.singleFileBytes = 10;
	});
	await assert.rejects(
		writeDriveFile({ aliasId: 'alpha', path: 'large.txt', content: 'four', $i }),
		error => error.code === 'STORAGE_QUOTA_EXCEEDED'
	);
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.storedBytes, 0);
	assert.equal(state.usage.fileCount, 0);
	assert.equal(Object.keys(state.reservations).length, 0);
});

test('prevents two active writes from reserving one path', async t => {
	const $i = context(t);
	await mutateDriveState('alpha', $i, state => createWriteReservation(state, 'same.txt', 4));
	await assert.rejects(
		mutateDriveState('alpha', $i, state => createWriteReservation(state, 'same.txt', 4)),
		error => error.code === 'TRANSFER_CONFLICT'
	);
});

test('copy charges bytes, move does not, trash retains quota, purge releases it', async t => {
	const $i = context(t);
	await writeDriveFile({ aliasId: 'alpha', path: 'docs/a.txt', content: 'abc', $i });
	await copyDriveEntry({ aliasId: 'alpha', fromPath: 'docs/a.txt', toPath: 'docs/b.txt', $i });
	let state = await readDriveState('alpha', $i);
	assert.equal(state.usage.storedBytes, 6);
	assert.equal(state.usage.fileCount, 2);
	await moveDriveEntry({ aliasId: 'alpha', fromPath: 'docs/b.txt', toPath: 'archive/b.txt', $i });
	state = await readDriveState('alpha', $i);
	assert.equal(state.usage.storedBytes, 6);
	assert.equal(state.entries['archive/b.txt'].size, 3);
	await trashDriveEntry({ aliasId: 'alpha', path: 'archive', $i });
	state = await readDriveState('alpha', $i);
	assert.equal(state.usage.storedBytes, 6);
	assert.ok(state.entries['archive/b.txt'].trashedAt);
	await restoreDriveEntry({ aliasId: 'alpha', path: 'archive', $i });
	assert.equal((await readDriveState('alpha', $i)).entries['archive/b.txt'].trashedAt, null);
	await purgeDriveEntry({ aliasId: 'alpha', path: 'archive', $i });
	state = await readDriveState('alpha', $i);
	assert.equal(state.usage.storedBytes, 3);
	assert.equal(state.usage.fileCount, 1);
});
