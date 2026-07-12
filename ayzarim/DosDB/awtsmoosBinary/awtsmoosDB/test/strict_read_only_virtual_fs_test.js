// B"H

/**
 * @file test/strict_read_only_virtual_fs_test.js
 * @chapter The Filesystem Is Seen Without Disturbing One Inode
 * @description
 * Proves that VirtualFs listing, reads, ranges, grep, stat, and close preserve
 * every database artifact exactly while all mutation gates refuse access.
 */

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function snapshot(directory) {
	const output = {};
	for (const name of fs.readdirSync(directory).sort()) {
		const filePath = path.join(directory, name);
		const stat = fs.statSync(filePath, { bigint: true });
		output[name] = stat.isDirectory()
			? { type: 'directory', mtimeNs: stat.mtimeNs.toString(), entries: fs.readdirSync(filePath).sort() }
			: {
				type: 'file',
				size: stat.size.toString(),
				mtimeNs: stat.mtimeNs.toString(),
				hash: crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
			};
	}
	return output;
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-fs-read-only-'));
const dbPath = path.join(directory, 'filesystem.awtsdb');
const hebrew = 'אור אין סוף בתוך קובץ';
let db;

try {
	db = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: 'verified' });
	db.open();
	db.fs.mkdir('/docs');
	db.fs.mkdir('/docs/nested');
	db.fs.write('/docs/readme.txt', `${hebrew}\nreachable English`);
	db.fs.write('/docs/nested/binary.bin', Buffer.alloc(128 * 1024, 37));
	db.close();
	db = null;
	fs.chmodSync(dbPath, 0o444);

	const before = snapshot(directory);
	db = new AwtsmoosDB(dbPath, { readOnly: true });
	db.open();
	assert(db.fs.ls('/docs').join(',') === 'nested,readme.txt', 'directory listing changed');
	assert(db.fs.cat('/docs/readme.txt').toString('utf8').includes(hebrew), 'Hebrew file changed');
	assert(db.fs.readRange('/docs/nested/binary.bin', 4096, 64).every(byte => byte === 37), 'binary range changed');
	assert(db.fs.grep(/reachable English/, '/').includes('/docs/readme.txt'), 'grep missed live file');
	assert(db.fs.stat('/docs/nested/binary.bin').size === 128 * 1024, 'stat size changed');
	assert(db.verify().ok, 'VirtualFs verification failed');

	for (const operation of [
		() => db.fs.write('/docs/new.txt', 'forbidden'),
		() => db.fs.mkdir('/forbidden'),
		() => db.fs.rm('/docs/readme.txt')
	]) {
		let refused = false;
		try { operation(); } catch (error) { refused = error.code === 'AWTSMOOS_DB_READONLY_WRITE'; }
		assert(refused, 'VirtualFs mutation was not refused');
	}
	db.close();
	db = null;

	assert(JSON.stringify(snapshot(directory)) === JSON.stringify(before), 'read-only VirtualFs changed source artifacts');
} finally {
	if (db) db.close();
	try { fs.chmodSync(dbPath, 0o644); } catch (_error) {}
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H strict_read_only_virtual_fs_test PASS');
