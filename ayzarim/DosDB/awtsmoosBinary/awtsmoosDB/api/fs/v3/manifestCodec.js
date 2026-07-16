// B"H

/**
 * @file api/fs/v3/manifestCodec.js
 * @chapter The Map Is Folded Without Losing One Road
 * @description
 * Owns the FS3 manifest token. Legacy JSON bodies remain readable, while new
 * manifests may store compressed bytes with validated original and stored lengths.
 */

const { ROOT_INODE, ROOT_PATH } = require('./schema');
const compression = require('./manifestCompression.js');

function now() { return Date.now(); }
function plain(value) { return value && value.__resolve__ ? value.__resolve__() : value; }
function objectOrEmpty(value) { return value && typeof value === 'object' ? value : {}; }

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

function tokenBlob(token) {
	const value = plain(token);
	if (!value || value.__fs3ManifestBlob !== true) return null;
	const blob = plain(value.blob);
	return blob && blob.__awtsmoosBlob === true ? blob : null;
}

function decodeManifest(db, token) {
	const value = plain(token);
	const blob = tokenBlob(value);
	if (blob) {
		const bytes = compression.decodeManifestBytes(db, value, blob);
		const text = bytes.toString('utf8');
		if (!text.trimStart().startsWith('{')) {
			const error = new SyntaxError(`FS3_MANIFEST_NOT_JSON bytes=${bytes.length}`);
			error.code = 'AWTSMOOS_FS3_BAD_MANIFEST';
			throw error;
		}
		return JSON.parse(text);
	}
	if (value && value.version === 3 && value.inodes) return value;
	return blankManifest();
}

function encodeManifest(db, manifest) {
	const previous = plain(db.root && db.root.__fs3_manifest__);
	const previousBlob = tokenBlob(previous);
	const bytes = Buffer.from(JSON.stringify(manifest), 'utf8');
	const encoded = compression.encodeManifestBytes(db, bytes);
	const blob = db.blob.create(encoded.stored, {
		kind: 'fs3-manifest',
		bytes: bytes.length,
		storedBytes: encoded.stored.length,
		codec: encoded.codec || 'identity'
	});
	if (previousBlob) db.blob.delete(previousBlob);
	return {
		__fs3ManifestBlob: true,
		version: 3,
		bytes: bytes.length,
		storedBytes: encoded.stored.length,
		...(encoded.codec ? { codec: encoded.codec } : {}),
		blob
	};
}

function normalizeManifest(manifest) {
	const value = manifest || blankManifest();
	value.version = 3;
	value.nextInode ||= 1;
	value.tx ||= { active: null, lastCommitted: 0 };
	value.inodes = objectOrEmpty(value.inodes);
	value.paths = objectOrEmpty(value.paths);
	value.children = objectOrEmpty(value.children);
	if (!value.inodes[ROOT_INODE] || value.inodes[ROOT_INODE].type !== 'dir') {
		value.inodes[ROOT_INODE] = rootInodeRecord();
	}
	value.paths[ROOT_PATH] = ROOT_INODE;
	value.children[ROOT_INODE] ||= {};
	let maximum = 0;
	for (const id of Object.keys(value.inodes)) {
		if (/^i\d+$/.test(id)) maximum = Math.max(maximum, Number(id.slice(1)));
	}
	value.nextInode = Math.max(value.nextInode, maximum + 1);
	return value;
}

module.exports = {
	CODEC: compression.CODEC,
	blankManifest,
	decodeManifest,
	encodeManifest,
	normalizeManifest,
	tokenBlob
};