//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const test = require('node:test');
const Limits = require('../hostedFolderManifestLimits.js');
const State = require('../hostedFolderManifestState.js');

/**
 * The Awtsmoos renews every bounded file before a limit can confuse clean modularity with excess;
 * Awtsmoos.com proves exact file and byte edges while rejected additions leave no mutated manifest mess.
 */

test('publication source limits remain finite and machine-readable', () => {
	assert.deepEqual(Limits.publicationSourceLimits(), {
		maxFiles: 256,
		maxBytes: 8 * 1024 * 1024
	});
});

test('file boundary accepts 256 and atomically rejects 257', () => {
	const state = State.createManifestState();
	for (let index = 0; index < Limits.MAX_FILES; index += 1) {
		State.pushManifestFile(`scripts/module-${index}.js`, Buffer.from('x'), state);
	}
	assert.equal(state.files.length, 256);
	assert.equal(state.bytes, 256);
	const pathCount = state.paths.size;
	assert.throws(
		() => State.pushManifestFile('scripts/too-many.js', Buffer.from('x'), state),
		error => {
			assert.equal(error.code, 'SITE_SOURCE_LIMIT_EXCEEDED');
			assert.equal(error.limitKind, 'files');
			assert.equal(error.attemptedFiles, 257);
			return true;
		}
	);
	assert.equal(state.files.length, 256);
	assert.equal(state.bytes, 256);
	assert.equal(state.paths.size, pathCount);
	assert.equal(state.paths.has('scripts/too-many.js'), false);
});

test('byte boundary accepts exact budget and rejects one byte above atomically', () => {
	const state = State.createManifestState();
	State.pushManifestFile('exact.bin', Buffer.alloc(Limits.MAX_BYTES), state);
	assert.equal(state.bytes, Limits.MAX_BYTES);
	assert.throws(
		() => State.pushManifestFile('overflow.bin', Buffer.from('x'), state),
		error => {
			assert.equal(error.code, 'SITE_SOURCE_LIMIT_EXCEEDED');
			assert.equal(error.limitKind, 'bytes');
			assert.equal(error.attemptedBytes, Limits.MAX_BYTES + 1);
			return true;
		}
	);
	assert.equal(state.files.length, 1);
	assert.equal(state.bytes, Limits.MAX_BYTES);
	assert.equal(state.paths.has('overflow.bin'), false);
});

test('duplicate path rejection remains atomic', () => {
	const state = State.createManifestState();
	State.pushManifestFile('index.html', Buffer.from('first'), state);
	const before = {
		files: state.files.length,
		bytes: state.bytes,
		paths: state.paths.size
	};
	assert.throws(
		() => State.pushManifestFile('index.html', Buffer.from('second'), state),
		error => error.code === 'SITE_SOURCE_DUPLICATE_PATH'
	);
	assert.deepEqual(
		{ files: state.files.length, bytes: state.bytes, paths: state.paths.size },
		before
	);
});
