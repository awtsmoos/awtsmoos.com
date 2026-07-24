// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardManifest
 * @description
 * Converts reviewed manifests into bounded descriptions. Multipart identity and
 * partial-publication metadata survive discovery while vectors remain unopened
 * until an explicitly supported vector request crosses that boundary.
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

function isPublishable(manifest) {
	return Boolean(
		manifest
		&& manifest.disabled !== true
		&& manifest.listName
		&& Number(manifest.records || manifest.listLength) > 0
		&& Number(manifest.dimensions) > 0
	);
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

function describeFile(file) {
	const manifest = manifestFor(file);
	const fileSlug = slug(file);
	const id = String(manifest?.id || fileSlug).toLowerCase();
	const partNumber = Number(String(manifest?.partId || '').match(/\d+/)?.[0] || 0);
	const partial = id === 'sichos-kodesh';
	return {
		id,
		aliases: aliases(id, fileSlug, manifest?.aliases),
		title: manifest?.title || label(id),
		file,
		listName: manifest.listName,
		count: Number(manifest.records || manifest.listLength || 0),
		dimensions: Number(manifest.dimensions || 0),
		vectorEnabled: false,
		bytes: stat(file)?.size || 0,
		textFile: textFileFor(file, manifest),
		partNumber,
		partial,
		expectedParts: partial ? SICHOS_KODESH_EXPECTED_PARTS : 1,
		textOnly: partial
	};
}

function shardFiles($i) {
	return publishedShardFiles($i)
		.filter(file => isPublishable(manifestFor(file)));
}

module.exports = {
	aliases,
	describeFile,
	isPublishable,
	manifestFor,
	manifestPath,
	shardFiles,
	slug,
	textFileFor
};
