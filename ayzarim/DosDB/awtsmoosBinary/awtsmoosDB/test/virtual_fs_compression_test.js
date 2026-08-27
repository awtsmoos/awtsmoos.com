// B"H

/**
 * @file test/virtual_fs_compression_test.js
 * @chapter The Vessel Shrinks And Every Letter Returns
 * @description
 * Proves legacy identity compatibility, transparent compressed writes, exact
 * ranges and mutations, compressed manifests, restart persistence, and a semantic
 * vacuum whose destination is smaller while every virtual byte remains identical.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const store = require('../api/fs/v3/store.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function sha256(bytes) {
	return crypto.createHash('sha256').update(bytes).digest('hex');
}

function inodeToken(database, filePath) {
	const inode = store.pathToInode(database, filePath);
	return inode.data?.__resolve__ ? inode.data.__resolve__() : inode.data;
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-fs-compression-'));
const sourcePath = path.join(directory, 'legacy.awtsdb');
const candidatePath = path.join(directory, 'compact.awtsdb');
const content = Buffer.from('B"H repeated revelation '.repeat(30000));
let database;

try {
	database = new AwtsmoosDB(sourcePath, {
		compression: false,
		virtualFsCompression: false,
		reuseFreedSpace: false
	});
	database.open();
	database.fs.mkdir('/content');
	database.fs.write('/content/post.json', content);
	const legacyToken = inodeToken(database, '/content/post.json');
	assert(!legacyToken.meta.fs3Codec, 'legacy source unexpectedly compressed');
	database.close();
	database = null;

	const sourceSize = fs.statSync(sourcePath).size;
	const manifest = AwtsmoosDB.vacuumFile(sourcePath, candidatePath, {
		compression: false,
		cleanupOnFailure: true
	});
	assert(manifest.comparison.ok, 'compressed vacuum semantic comparison failed');
	assert(manifest.copyStats.virtualFsFiles === 1, 'vacuum did not copy one live file');
	assert(fs.statSync(candidatePath).size < sourceSize / 4, 'candidate did not shrink enough');

	database = new AwtsmoosDB(candidatePath, { readOnly: true });
	database.open();
	const compressedToken = inodeToken(database, '/content/post.json');
	const manifestToken = database.root.__fs3_manifest__.__resolve__();
	assert(compressedToken.meta.fs3Codec === 'deflate-raw-v1', 'file codec missing');
	assert(manifestToken.codec === 'deflate-raw-v1', 'manifest codec missing');
	assert(database.fs.stat('/content/post.json').size === content.length, 'logical size changed');
	assert(sha256(database.fs.cat('/content/post.json')) === sha256(content), 'full bytes changed');
	assert(database.fs.readRange('/content/post.json', 101, 333).equals(content.subarray(101, 434)), 'range bytes changed');
	database.close();
	database = null;

	database = new AwtsmoosDB(candidatePath, { reuseFreedSpace: 'verified' });
	database.open();
	database.fs.writeRange('/content/post.json', 10, Buffer.from('AWTSMOOS'));
	database.fs.append('/content/post.json', Buffer.from(' END'));
	const expected = Buffer.concat([
		Buffer.from(content),
		Buffer.from(' END')
	]);
	Buffer.from('AWTSMOOS').copy(expected, 10);
	assert(database.fs.cat('/content/post.json').equals(expected), 'mutation bytes changed');
	database.close();
	database = null;

	database = new AwtsmoosDB(candidatePath, { readOnly: true });
	database.open();
	assert(database.fs.cat('/content/post.json').equals(expected), 'restart bytes changed');
	assert(database.verify().ok, 'compressed database verification failed');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H virtual_fs_compression_test PASS');