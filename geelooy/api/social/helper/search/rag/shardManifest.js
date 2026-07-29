// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardManifest
 * @description
 * Converts reviewed manifests into truthful vector or text-only descriptions.
 * The Awtsmoos preserves every corpus boundary; Awtsmoos.com exposes declared
 * aliases alone, never leaking multipart filenames into the public lane identity.
 */

const {
	SICHOS_KODESH_EXPECTED_PARTS
} = require('./canonicalShards.js');
const { readManifest } = require('./manifestCache.js');
const { stat } = require('./paths.js');
const { publishedShardFiles } = require('./shardSources.js');
const {
	aliases,
	label,
	slug
} = require('./shardIdentity.js');

function manifestPath(file) {
	return file.replace(/\.awtsdb$/, '.fast-manifest.json');
}

function manifestFor(file) {
	return readManifest(manifestPath(file));
}

function recordCount(manifest = {}) {
	return Number(manifest.records ?? manifest.listLength ?? 0);
}

function textFileFor(file, manifest = {}) {
	const candidates = [
		file.replace(/\.awtsdb$/, '.fast-meta.jsonl'),
		file.replace(/\.awtsdb$/, '.meta.jsonl'),
		manifest.textFile,
		manifest.metadataSidecar,
		manifest.metadata
	];
	return candidates.find(candidate => candidate && stat(candidate)) || null;
}

function isPublishable(manifest, file = '') {
	if (!manifest || manifest.disabled === true) return false;
	if (recordCount(manifest) < 1) return false;
	if (manifest.textOnly === true) {
		return Boolean(file && textFileFor(file, manifest));
	}
	return Boolean(manifest.listName && Number(manifest.dimensions) > 0);
}

function expectedParts(manifest, id) {
	const declared = Number(manifest?.expectedParts || 0);
	if (declared > 0) return declared;
	return id === 'sichos-kodesh' ? SICHOS_KODESH_EXPECTED_PARTS : 1;
}

function partNumber(manifest = {}) {
	const declared = Number(manifest.partNumber || 0);
	if (declared > 0) return declared;
	return Number(String(manifest.partId || '').match(/\d+/)?.[0] || 0);
}

function describeFile(file) {
	const manifest = manifestFor(file) || {};
	const fileSlug = slug(file);
	const id = String(manifest.id || fileSlug).toLowerCase();
	const textOnly = manifest.textOnly === true || id === 'sichos-kodesh';
	return {
		id,
		aliases: aliases(id, id, manifest.aliases),
		title: manifest.title || label(id),
		file,
		listName: manifest.listName || null,
		count: recordCount(manifest),
		dimensions: Number(manifest.dimensions || 0),
		vectorEnabled: false,
		bytes: stat(file)?.size || 0,
		textFile: textFileFor(file, manifest),
		partNumber: partNumber(manifest),
		partial: manifest.partial === true,
		expectedParts: expectedParts(manifest, id),
		textOnly
	};
}

function shardFiles($i) {
	return publishedShardFiles($i)
		.filter(file => isPublishable(manifestFor(file), file));
}

module.exports = {
	aliases,
	describeFile,
	expectedParts,
	isPublishable,
	manifestFor,
	manifestPath,
	partNumber,
	recordCount,
	shardFiles,
	slug,
	textFileFor
};
