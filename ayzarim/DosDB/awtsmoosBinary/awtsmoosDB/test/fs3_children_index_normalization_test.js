//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file fs3_children_index_normalization_test.js
 * @chapter The Census Happens Once And The Road Book Can Sleep
 * @description
 * Proves FS3 heals authoritative child links once, resolves paths through that
 * graph with no retained global path table, and never enumerates all inodes for
 * an ordinary directory read.
 */

const codec = require('../api/fs/v3/manifestCodec.js');
const store = require('../api/fs/v3/store.js');

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
			i0: { id: 'i0', type: 'dir', name: '', parent: null, path: '/', deleted: false },
			i1: { id: 'i1', type: 'dir', name: 'docs', parent: 'i0', path: '/docs', deleted: false },
			i2: { id: 'i2', type: 'file', name: 'live.txt', parent: 'i1', path: '/docs/live.txt', deleted: false },
			i3: { id: 'i3', type: 'file', name: 'deleted.txt', parent: 'i1', path: '/docs/deleted.txt', deleted: true }
		}
	};
}

const normalized = codec.normalizeManifestWithMeta(fixture());
assert(normalized.repairs > 0, 'missing live child did not count as repair');
assert(normalized.manifest.children.i1['live.txt'] === 'i2', 'live child was not healed');
assert(normalized.manifest.children.i1.stale === 'missing', 'stale alias should remain lazy');
delete normalized.manifest.paths;

const database = {
	__fs3Manifest: normalized.manifest,
	__fs3ManifestDirty: false,
	options: { readOnly: false },
	root: {}
};

assert(store.pathToInodeId(database, '/docs/live.txt') === 'i2', 'child graph path lookup failed');
assert(store.pathToInodeId(database, '/docs/deleted.txt') === null, 'deleted path resolved');
assert(store.pathToInodeId(database, '/missing') === null, 'missing path resolved');

const inodeAuthority = normalized.manifest.inodes;
normalized.manifest.inodes = new Proxy(inodeAuthority, {
	ownKeys() {
		throw new Error('GLOBAL_INODE_ENUMERATION_FORBIDDEN');
	}
});
const children = store.getChildren(database, 'i1');

assert(Object.keys(children).join(',') === 'live.txt', 'directory read returned stale aliases');
assert(children['live.txt'] === 'i2', 'live child identity changed');
assert(!normalized.manifest.children.i1.stale, 'stale alias was not removed');
assert(!normalized.manifest.children.i1.deleted, 'deleted alias was not removed');
assert(database.__fs3ManifestDirty === true, 'lazy writable cleanup did not mark dirty');

normalized.manifest.inodes = inodeAuthority;
const persisted = codec.persistedPaths(normalized.manifest.inodes);
assert(persisted['/docs/live.txt'] === 'i2', 'legacy persistence path projection failed');
assert(!persisted['/docs/deleted.txt'], 'deleted inode leaked into persistence paths');
console.log('B"H fs3_children_index_normalization_test PASS');
