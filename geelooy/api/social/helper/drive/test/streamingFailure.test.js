//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos dissolves partial vessels when length, quota, or replay diverges;
 * Awtsmoos.com proves no temporary object, lease, or reservation survives.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Readable } = require('node:stream');
const { uploadDriveStream } = require('../streamingUploadService.js');
const { readDriveState } = require('../stateRepository.js');
const { drivePaths } = require('../storagePaths.js');
const { createDriveTestContext } = require('./testContext.js');

function options($i, content, bytes, key = 'failure-key') {
	return {
		aliasId: 'alpha',
		path: 'failed/item.bin',
		bytes,
		idempotencyKey: key,
		mime: 'application/octet-stream',
		visibility: 'private',
		cachePolicy: 'mutable',
		requestId: key,
		actorUserId: 'owner',
		request: Readable.from([content]),
		$i
	};
}

async function assertClean($i, expectedFiles = 0) {
	const state = await readDriveState('alpha', $i);
	assert.equal(Object.keys(state.reservations).length, 0);
	assert.equal(Object.keys(state.transferLeases).length, 0);
	assert.equal(Object.values(state.entries).filter(entry => entry.type === 'file').length, expectedFiles);
	const incoming = path.join(drivePaths('alpha', $i).root, 'incoming');
	const temporary = await fs.promises.readdir(incoming).catch(() => []);
	assert.deepEqual(temporary, []);
}

test('rejects short and excessive bodies without partial state', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-stream-length-');
	await assert.rejects(uploadDriveStream(options($i, Buffer.from('abc'), 5)), {
		code: 'CONTENT_LENGTH_MISMATCH'
	});
	await assertClean($i);
	await assert.rejects(uploadDriveStream(options($i, Buffer.from('abcde'), 3, 'overrun')), {
		code: 'CONTENT_LENGTH_EXCEEDED'
	});
	await assertClean($i);
});

test('rejects oversized declared files before reading the request', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-stream-limit-');
	const tooLarge = (512 * 1024 * 1024) + 1;
	await assert.rejects(uploadDriveStream(options($i, Buffer.alloc(0), tooLarge)), {
		code: 'SINGLE_FILE_QUOTA_EXCEEDED'
	});
	await assertClean($i);
});

test('rejects conflicting idempotency and removes the unreferenced object', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-stream-conflict-');
	await uploadDriveStream(options($i, Buffer.from('first'), 5, 'same-key'));
	await assert.rejects(uploadDriveStream(options($i, Buffer.from('other'), 5, 'same-key')), {
		code: 'IDEMPOTENCY_CONFLICT'
	});
	await assertClean($i, 1);
	const objectFiles = await walkFiles(drivePaths('alpha', $i).objects);
	assert.equal(objectFiles.length, 1);
});

async function walkFiles(directory) {
	const entries = await fs.promises.readdir(directory, { withFileTypes: true }).catch(() => []);
	const nested = await Promise.all(entries.map(entry => {
		const absolute = path.join(directory, entry.name);
		return entry.isDirectory() ? walkFiles(absolute) : [absolute];
	}));
	return nested.flat();
}
