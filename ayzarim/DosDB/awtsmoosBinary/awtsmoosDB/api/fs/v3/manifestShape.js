//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file manifestShape.js
 * @chapter The Vessel Receives One Truthful Shape
 * @description
 * The Awtsmoos gives every FS3 manifest a stable form for Awtsmoos.com.
 * Defaults, root identity, inode numbering, and compatibility links are healed
 * once at load, with explicit repair metadata for durable self-healing.
 */

const { ROOT_INODE, ROOT_PATH } = require('./schema');
const indexes = require('./manifestIndexes.js');

function now() {
	return Date.now();
}

function blankManifest() {
	return {
		version: 3,
		nextInode: 1,
		tx: { active: null, lastCommitted: 0 },
		inodes: {},
		paths: {},
		children: {}
	};
}

function rootInodeRecord() {
	return {
		id: ROOT_INODE,
		type: 'dir',
		name: '',
		parent: null,
		path: ROOT_PATH,
		size: 0,
		ctime: now(),
		mtime: now(),
		version: 1,
		deleted: false
	};
}

function ensureObject(value, key) {
	if (value[key] && typeof value[key] === 'object') return 0;
	value[key] = {};
	return 1;
}

function ensureRoot(value) {
	let repairs = 0;
	const root = value.inodes[ROOT_INODE];
	if (!root || root.type !== 'dir') {
		value.inodes[ROOT_INODE] = rootInodeRecord();
		repairs++;
	}
	if (value.paths[ROOT_PATH] !== ROOT_INODE) {
		value.paths[ROOT_PATH] = ROOT_INODE;
		repairs++;
	}
	return repairs;
}

function nextInodeFloor(inodes) {
	let maximum = 0;
	for (const id in inodes) {
		if (/^i\d+$/.test(id)) {
			maximum = Math.max(maximum, Number(id.slice(1)));
		}
	}
	return maximum + 1;
}

function normalizeManifestWithMeta(manifest) {
	const value = manifest || blankManifest();
	let repairs = 0;
	if (value.version !== 3) {
		value.version = 3;
		repairs++;
	}
	if (!value.tx || typeof value.tx !== 'object') {
		value.tx = { active: null, lastCommitted: 0 };
		repairs++;
	}
	repairs += ensureObject(value, 'inodes');
	repairs += ensureObject(value, 'paths');
	repairs += ensureObject(value, 'children');
	repairs += ensureRoot(value);
	const floor = nextInodeFloor(value.inodes);
	if (!Number.isFinite(value.nextInode) || value.nextInode < floor) {
		value.nextInode = floor;
		repairs++;
	}
	const childRepairs = indexes.reconcileChildren(value);
	repairs += childRepairs;
	return { manifest: value, repairs, childRepairs };
}

function normalizeManifest(manifest) {
	return normalizeManifestWithMeta(manifest).manifest;
}

module.exports = {
	blankManifest,
	normalizeManifest,
	normalizeManifestWithMeta
};
