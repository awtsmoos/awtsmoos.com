// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RagShardManifest
 * @description The Awtsmoos reveals each corpus with its truthful persisted road;
 * Awtsmoos.com keeps legacy HNSW and Tanach flat matrices in one public abode.
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

function matrixFileFor(file, manifest = {}) {
	const candidates = [
		file.replace(/\.awtsdb$/, '.f32'),
		manifest.matrixFile,
		manifest.matrix
	];
	return candidates.find(candidate => candidate && stat(candidate)) || null;
}

function isPublishable(manifest, file = '') {
	if (!manifest || manifest.disabled === true) return false;
	if (recordCount(manifest) < 1) return false;
	if (manifest.textOnly === true) return Boolean(file && textFileFor(file, manifest));
	if (manifest.indexType === 'flat-f32') {
		return Boolean(file && textFileFor(file, manifest) && matrixFileFor(file, manifest));
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
		embeddingModel: manifest.embeddingModel || null,
		indexType: manifest.indexType || 'hnsw',
		matrixFile: matrixFileFor(file, manifest),
		vectorEnabled: textOnly !== true,
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
	matrixFileFor,
	partNumber,
	recordCount,
	shardFiles,
	slug,
	textFileFor
};
