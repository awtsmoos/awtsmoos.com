// B"H

/**
 * @file test/fs3_children_index_normalization_test.js
 * @chapter The Census Happens Once And The Road Book Can Sleep
 * @description
 * Proves FS3 heals authoritative child links once, resolves paths through that
 * graph with no retained global path table, and never enumerates all inodes for
 * an ordinary directory read. The record layout is seeded directly; stale
 * aliases are cleaned lazily and the cleanup persists across a close/reopen.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
const codec = require('../api/fs/v3/manifestCodec.js');
const store = require('../api/fs/v3/store.js');
const { recordKeys } = require('../api/fs/v3/storeState.js');
const inodeKey = id => recordKeys.INODE_PREFIX + id;
const childKey = id => recordKeys.CHILD_PREFIX + id;

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function fixture() {
	return {
		version: 3,
		nextInode: 5,
		tx: { active: null, lastCommitted: 0 },
		paths: { '/': 'i0', '/docs': 'i1', '/docs/live.txt': 'i2' },
		children: { i0: { docs: 'i1' }, i1: { stale: 'missing', deleted: 'i3' } },
		inodes: {
			i0: { id: 'i0', type: 'dir', name: '', parent: null, path: '/', size: 0, ctime: 1, mtime: 1, version: 1, deleted: false },
			i1: { id: 'i1', type: 'dir', name: 'docs', parent: 'i0', path: '/docs', size: 0, ctime: 1, mtime: 1, version: 1, deleted: false },
			i2: { id: 'i2', type: 'file', name: 'live.txt', parent: 'i1', path: '/docs/live.txt', size: 0, ctime: 1, mtime: 1, version: 1, deleted: false },
			i3: { id: 'i3', type: 'file', name: 'deleted.txt', parent: 'i1', path: '/docs/deleted.txt', size: 0, ctime: 1, mtime: 1, version: 1, deleted: true }
		}
	};
}

// The normalizer still heals a missing authoritative link at load.
const normalized = codec.normalizeManifestWithMeta(fixture());
assert(normalized.repairs > 0, 'missing live child did not count as repair');
assert(normalized.manifest.children.i1['live.txt'] === 'i2', 'live child was not healed');
assert(normalized.manifest.children.i1.stale === 'missing', 'stale alias should remain lazy');
delete normalized.manifest.paths;

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-fs3-children-'));
const dbPath = path.join(directory, 'children.awtsdb');
let database;

try {
	database = new AwtsmoosDB(dbPath, { compression: false, reuseFreedSpace: false });
	database.open();
	// Seed the per-inode record layout directly.
	database.batch(() => {
		database.root[recordKeys.META_KEY] = {
			__fs3Meta: true,
			version: normalized.manifest.version,
			nextInode: normalized.manifest.nextInode,
			tx: normalized.manifest.tx
		};
		for (const [id, inode] of Object.entries(normalized.manifest.inodes)) {
			database.root[inodeKey(id)] = inode;
		}
		for (const [id, children] of Object.entries(normalized.manifest.children)) {
			database.root[childKey(id)] = children;
		}
	});

	assert(store.pathToInodeId(database, '/docs/live.txt') === 'i2', 'child graph path lookup failed');
	assert(store.pathToInodeId(database, '/docs/deleted.txt') === null, 'deleted path resolved');
	assert(store.pathToInodeId(database, '/missing') === null, 'missing path resolved');

	// A directory read touches only its own child record: stale aliases are
	// dropped from the returned map and the record is rewritten dirty.
	const children = store.getChildren(database, 'i1');
	assert(Object.keys(children).join(',') === 'live.txt', 'directory read returned stale aliases');
	assert(children['live.txt'] === 'i2', 'live child identity changed');

	database.close();
	database = null;

	// The lazy cleanup persisted: stale aliases are gone after reopen.
	database = new AwtsmoosDB(dbPath, { readOnly: true });
	database.open();
	const persisted = database.root[childKey('i1')];
	const plain = persisted && persisted.__resolve__ ? persisted.__resolve__() : persisted;
	assert(plain && !('stale' in plain), 'stale alias survived the lazy cleanup');
	assert(plain && !('deleted' in plain), 'deleted alias survived the lazy cleanup');
	assert(plain && plain['live.txt'] === 'i2', 'live child lost in the lazy cleanup');
	assert(store.pathToInodeId(database, '/docs/live.txt') === 'i2', 'path lookup failed after reopen');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H fs3_children_index_normalization_test PASS');
