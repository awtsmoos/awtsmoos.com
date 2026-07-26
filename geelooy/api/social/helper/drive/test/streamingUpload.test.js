//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets a bounded river become one deduplicated object of light;
 * Awtsmoos.com proves replay, metadata, usage, and cleanup remain right.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { Readable } = require('node:stream');
const { uploadDriveStream } = require('../streamingUploadService.js');
const { readDriveState } = require('../stateRepository.js');
const { drivePaths, objectPath } = require('../storagePaths.js');
const { createDriveTestContext } = require('./testContext.js');

function uploadOptions($i, content, key) {
	return {
		aliasId: 'alpha',
		path: 'nested/stream.txt',
		bytes: content.length,
		idempotencyKey: key,
		mime: 'text/plain',
		visibility: 'public',
		cachePolicy: 'mutable',
		requestId: key,
		actorUserId: 'owner',
		credentialId: null,
		request: Readable.from([content.subarray(0, 7), content.subarray(7)]),
		$i
	};
}

test('streams, hashes, commits, and replays without duplicate logical usage', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-stream-success-');
	const content = Buffer.from('B"H\nA bounded streaming upload.\n');
	const hash = crypto.createHash('sha256').update(content).digest('hex');
	const first = await uploadDriveStream(uploadOptions($i, content, 'stream-key-1'));
	assert.equal(first.replayed, false);
	assert.equal(first.entry.objectHash, hash);
	assert.equal(first.entry.size, content.length);
	assert.equal(first.entry.visibility, 'public');
	assert.equal(first.object.created, true);
	const stored = await fs.promises.readFile(objectPath(drivePaths('alpha', $i), hash));
	assert.deepEqual(stored, content);
	const replay = await uploadDriveStream(uploadOptions($i, content, 'stream-key-1'));
	assert.equal(replay.replayed, true);
	assert.equal(replay.object.created, false);
	const state = await readDriveState('alpha', $i);
	assert.equal(state.usage.fileCount, 1);
	assert.equal(state.usage.storedBytes, content.length);
	assert.equal(Object.keys(state.reservations).length, 0);
	assert.equal(Object.keys(state.transferLeases).length, 0);
	assert.equal(Object.values(state.entries).filter(entry => entry.type === 'file').length, 1);
});
