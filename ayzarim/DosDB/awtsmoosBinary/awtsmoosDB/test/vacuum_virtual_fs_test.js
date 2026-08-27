// B"H

/**
 * @file test/vacuum_virtual_fs_test.js
 * @chapter Every Virtual Path Crosses With Its Exact Bytes
 * @description
 * Rewrites a VirtualFs hierarchy out of place, then compares recursive paths,
 * metadata, contents, nested blob relocation, semantic digest, and verification.
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

function inventory(db, current = '/') {
	const stat = db.fs.stat(current);
	if (stat.type === 'file') {
		const bytes = db.fs.cat(current);
		return [{ path: current, type: 'file', size: stat.size, hash: crypto.createHash('sha256').update(bytes).digest('hex') }];
	}
	const rows = [{ path: current, type: 'dir', size: 0 }];
	for (const name of db.fs.ls(current)) {
		rows.push(...inventory(db, current === '/' ? `/${name}` : `${current}/${name}`));
	}
	return rows;
}

function fileBlobOffset(db, filePath) {
	const inode = store.pathToInode(db, filePath);
	const data = inode && inode.data && inode.data.__resolve__ ? inode.data.__resolve__() : inode && inode.data;
	return data && data.offset;
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-fs-vacuum-'));
const sourcePath = path.join(directory, 'source.awtsdb');
const destinationPath = path.join(directory, 'candidate.awtsdb');
let source;
let destination;

try {
	source = new AwtsmoosDB(sourcePath, { compression: false, reuseFreedSpace: false });
	source.open();
	source.fs.mkdir('/texts');
	source.fs.mkdir('/binary');
	source.fs.write('/texts/hebrew.txt', 'יחי אדוננו מורנו ורבינו מלך המשיח לעולם ועד');
	source.fs.write('/texts/english.txt', 'the reachable filesystem remains exact');
	source.fs.write('/binary/pattern.bin', Buffer.alloc(256 * 1024, 91));
	source.fs.write('/discarded.bin', Buffer.alloc(1024 * 1024, 13));
	source.fs.rm('/discarded.bin');
	source.close();
	source = null;

	const manifest = AwtsmoosDB.vacuumFile(sourcePath, destinationPath, { compression: false, cleanupOnFailure: true });
	assert(manifest.sourceUnchanged, 'source changed during VirtualFs vacuum');
	assert(manifest.comparison.ok, 'VirtualFs semantic comparison failed');
	assert(manifest.copyStats.virtualFsManifests === 1, 'FS3 manifest was not relocated');

	source = new AwtsmoosDB(sourcePath, { readOnly: true });
	destination = new AwtsmoosDB(destinationPath, { readOnly: true });
	source.open();
	destination.open();
	assert(JSON.stringify(inventory(source)) === JSON.stringify(inventory(destination)), 'VirtualFs inventories differ');
	assert(source.semanticDigest() === destination.semanticDigest(), 'VirtualFs semantic digest differs');
	assert(source.verify().ok && destination.verify().ok, 'VirtualFs allocation verification failed');
	assert(fileBlobOffset(source, '/binary/pattern.bin') !== fileBlobOffset(destination, '/binary/pattern.bin'), 'file blob retained source offset');
	assert(destination.fs.readRange('/binary/pattern.bin', 1024, 128).every(byte => byte === 91), 'relocated binary bytes changed');
} finally {
	if (destination) destination.close();
	if (source) source.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H vacuum_virtual_fs_test PASS');
