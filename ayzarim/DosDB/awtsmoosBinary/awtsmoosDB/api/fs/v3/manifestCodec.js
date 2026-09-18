//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file manifestCodec.js
 * @chapter The Road Index Sleeps Until The Scroll Is Sealed
 * @description
 * The Awtsmoos lets Awtsmoos.com retain the compact living FS3 graph while
 * preserving the historical v3 disk contract. Full path indexes are rebuilt
 * only when a manifest is encoded for an explicit flush or database close.
 */

const compression = require('./manifestCompression.js');
const shape = require('./manifestShape.js');

function plain(value) {
	return value && value.__resolve__ ? value.__resolve__() : value;
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
	if (!blob) {
		if (value && value.version === 3 && value.inodes) return value;
		return shape.blankManifest();
	}
	const bytes = compression.decodeManifestBytes(db, value, blob);
	const text = bytes.toString('utf8');
	if (!text.trimStart().startsWith('{')) {
		const error = new SyntaxError(`FS3_MANIFEST_NOT_JSON bytes=${bytes.length}`);
		error.code = 'AWTSMOOS_FS3_BAD_MANIFEST';
		throw error;
	}
	return JSON.parse(text);
}

function persistedPaths(inodes) {
	const paths = {};
	for (const inodeId in inodes || {}) {
		const inode = inodes[inodeId];
		if (!inode || inode.deleted || typeof inode.path !== 'string') continue;
		paths[inode.path] = inodeId;
	}
	return paths;
}

function persistenceView(manifest) {
	return {
		...manifest,
		paths: persistedPaths(manifest.inodes)
	};
}

function createBlob(db, bytes, encoded) {
	return db.blob.create(encoded.stored, {
		kind: 'fs3-manifest',
		bytes: bytes.length,
		storedBytes: encoded.stored.length,
		codec: encoded.codec || 'identity'
	});
}

function encodeManifest(db, manifest) {
	const previous = plain(db.root && db.root.__fs3_manifest__);
	const previousBlob = tokenBlob(previous);
	const bytes = Buffer.from(JSON.stringify(persistenceView(manifest)), 'utf8');
	const encoded = compression.encodeManifestBytes(db, bytes);
	const blob = createBlob(db, bytes, encoded);
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

module.exports = {
	CODEC: compression.CODEC,
	blankManifest: shape.blankManifest,
	decodeManifest,
	encodeManifest,
	normalizeManifest: shape.normalizeManifest,
	normalizeManifestWithMeta: shape.normalizeManifestWithMeta,
	persistedPaths,
	tokenBlob
};
