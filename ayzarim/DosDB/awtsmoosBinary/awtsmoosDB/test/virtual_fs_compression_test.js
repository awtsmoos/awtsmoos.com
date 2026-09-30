// B"H

/**
 * @file test/virtual_fs_compression_test.js
 * @chapter The Vessel Shrinks And Every Letter Returns
 * @description
 * Proves legacy identity compatibility, transparent compressed writes, exact
 * ranges and mutations, restart persistence, and a semantic vacuum that
 * migrates a legacy manifest blob into the per-inode record layout: the
 * destination is smaller, every virtual byte remains identical, and no
 * __fs3_manifest__ token survives the crossing.
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
	const data = inode.data?.__resolve__ ? inode.data.__resolve__() : inode.data;
	return data;
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-fs-compression-'));
const sourcePath = path.join(directory, 'legacy.awtsdb');
const candidatePath = path.join(directory, 'compact.awtsdb');
const content = Buffer.from('B"H repeated revelation '.repeat(30000));
let database;

function buildLegacySource() {
	database = new AwtsmoosDB(sourcePath, {
		compression: false,
		virtualFsCompression: false,
		reuseFreedSpace: false
	});
	database.open();
	database.batch(() => {
		// Identity (uncompressed) file body, as the old writer produced.
		const fileBlob = database.blob.create(content, { kind: 'fs3-file', path: '/content/post.json' });
		const now = Date.now();
		const manifest = {
			version: 3,
			nextInode: 3,
			tx: { active: null, lastCommitted: 0 },
			inodes: {
				i0: { id: 'i0', type: 'dir', name: '', parent: null, path: '/', size: 0, ctime: now, mtime: now, version: 1, deleted: false },
				i1: { id: 'i1', type: 'dir', name: 'content', parent: 'i0', path: '/content', size: 0, ctime: now, mtime: now, version: 1, deleted: false },
				i2: { id: 'i2', type: 'file', name: 'post.json', parent: 'i1', path: '/content/post.json', size: content.length, dataKind: 'blob', data: fileBlob, ctime: now, mtime: now, version: 1, deleted: false }
			},
			children: {
				i0: { content: 'i1' },
				i1: { 'post.json': 'i2' }
			}
		};
		const json = Buffer.from(JSON.stringify(manifest), 'utf8');
		const manifestBlob = database.blob.create(json, { kind: 'fs3-manifest', bytes: json.length, storedBytes: json.length, codec: 'identity' });
		database.root.__fs3_manifest__ = {
			__fs3ManifestBlob: true,
			version: 3,
			bytes: json.length,
			storedBytes: json.length,
			blob: manifestBlob
		};
	});
	database.close();
	database = null;
}

try {
	buildLegacySource();
	const sourceSize = fs.statSync(sourcePath).size;

	// Legacy reads through the new code (read-only: no migration, served from
	// the decoded manifest).
	database = new AwtsmoosDB(sourcePath, { readOnly: true });
	database.open();
	assert(sha256(database.fs.cat('/content/post.json')) === sha256(content), 'legacy bytes changed');
	assert(database.fs.stat('/content/post.json').size === content.length, 'legacy size changed');
	database.close();
	database = null;

	const manifest = AwtsmoosDB.vacuumFile(sourcePath, candidatePath, {
		compression: false,
		cleanupOnFailure: true
	});
	assert(manifest.comparison.ok, 'compressed vacuum semantic comparison failed');
	assert(manifest.copyStats.virtualFsFiles === 1, 'vacuum did not migrate one live file');
	assert(fs.statSync(candidatePath).size < sourceSize / 4, 'candidate did not shrink enough');

	database = new AwtsmoosDB(candidatePath, { readOnly: true });
	database.open();
	const keys = database.keys(database.root).map(String);
	assert(!keys.includes('__fs3_manifest__'), 'legacy manifest token survived the vacuum');
	assert(keys.includes('__fs3_manifest_meta__'), 'meta record missing after vacuum');
	assert(keys.some(k => k.startsWith('__fs3_inode__')), 'inode records missing after vacuum');
	const compressedToken = inodeToken(database, '/content/post.json');
	assert(compressedToken.meta.fs3Codec === 'deflate-raw-v1', 'file codec missing');
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
