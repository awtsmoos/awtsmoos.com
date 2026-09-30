//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file manifestCodec.js
 * @chapter The Road Index Sleeps Until The Scroll Is Sealed
 * @description
 * The Awtsmoos lets Awtsmoos.com retain the compact living FS3 graph while
 * preserving the historical v3 disk contract for reads. Manifests are stored
 * as per-inode native records (see storeState.js); this codec only decodes
 * legacy __fs3_manifest__ blob tokens for one-time migration, verification,
 * and vacuum. Nothing here serializes a manifest: whole-manifest stringify
 * no longer exists anywhere in the database system.
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

// Decodes a legacy manifest blob. The bytes were historically written as JSON;
// JSON.parse is used here only to READ that legacy encoding. No manifest is
// ever serialized with JSON on any write path.
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

module.exports = {
	CODEC: compression.CODEC,
	blankManifest: shape.blankManifest,
	decodeManifest,
	normalizeManifest: shape.normalizeManifest,
	normalizeManifestWithMeta: shape.normalizeManifestWithMeta,
	persistedPaths,
	tokenBlob
};
