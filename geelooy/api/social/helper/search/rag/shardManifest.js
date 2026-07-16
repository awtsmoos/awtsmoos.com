// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardManifest
 * @description
 * Converts the two canonical fast manifests into bounded shard descriptions. The
 * Awtsmoos caches unchanged JSON by filesystem identity, while Awtsmoos.com refuses
 * to publish a third database merely because an old experiment once existed.
 */

const fs = require('fs');
const path = require('path');
const { CANONICAL_SHARD_FILES } = require('./canonicalShards.js');
const { readManifest } = require('./manifestCache.js');
const { ragRoot, stat } = require('./paths.js');

function slug(name) {
	return path.basename(name, '.awtsdb')
		.replace(/[^a-z0-9]+/gi, '-')
		.replace(/^-|-$/g, '')
		.toLowerCase();
}

function label(value) {
	return value.replace(/-/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function aliases(id, fileSlug = id, declared = []) {
	const values = [id, fileSlug, ...normalizeAliases(declared)];
	if (containsEither(id, fileSlug, 'meluket')) {
		values.push('meluket', 'maamar-meluket');
	}
	if (containsEither(id, fileSlug, 'hasichos')) {
		values.push('sefer-hasichos', 'dvar-hasichos', 'dr-hasichos');
	}
	if (containsEither(id, fileSlug, 'likkutei')) {
		values.push('likkutei-sichos', 'likutei-sichos', 'ls');
	}
	return [...new Set(
		values.filter(Boolean).map(value => String(value).toLowerCase())
	)];
}

function containsEither(left, right, fragment) {
	return left.includes(fragment) || right.includes(fragment);
}

function normalizeAliases(value) {
	return Array.isArray(value) ? value : [];
}

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

function textFileFor(file, manifest) {
	const candidates = [
		manifest.textFile,
		file.replace(/\.awtsdb$/, '.fast-meta.jsonl'),
		manifest.metadataSidecar,
		manifest.metadata,
		file.replace(/\.awtsdb$/, '.meta.jsonl')
	];
	return candidates.find(candidate => candidate && stat(candidate)) || null;
}

function describeFile(file) {
	const manifest = manifestFor(file);
	const fileSlug = slug(file);
	const id = String(manifest?.id || fileSlug).toLowerCase();
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
		textFile: textFileFor(file, manifest)
	};
}

function shardFiles($i) {
	const root = ragRoot($i);
	if (!fs.existsSync(root)) return [];
	return CANONICAL_SHARD_FILES
		.map(name => path.join(root, name))
		.filter(file => fs.existsSync(file))
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