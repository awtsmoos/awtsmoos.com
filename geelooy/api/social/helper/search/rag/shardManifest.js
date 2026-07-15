// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardManifest
 * @chapter A Canonical Corpus Keeps Every Historical Door Without Losing Its Name
 * @description
 * Converts complete fast manifests into bounded shard descriptions. The manifest ID
 * is canonical, while the database filename slug and declared aliases remain stable
 * compatibility names so published cutovers never break existing clients or probes.
 */

const fs = require('fs');
const path = require('path');
const { ragRoot, existingJson, stat } = require('./paths.js');

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
	if (id.includes('meluket') || fileSlug.includes('meluket')) {
		values.push('meluket', 'maamar-meluket');
	}
	if (id.includes('hasichos') || fileSlug.includes('hasichos')) {
		values.push('sefer-hasichos', 'dvar-hasichos', 'dr-hasichos');
	}
	if (id.includes('likkutei') || fileSlug.includes('likkutei')) {
		values.push('likkutei-sichos', 'likutei-sichos', 'ls');
	}
	if (id.includes('sichos-kodesh') || fileSlug.includes('sichos-kodesh')) {
		values.push('sichos-kodesh', 'sichos-kodesh-english', 'sk');
	}
	return [...new Set(values.filter(Boolean).map(value => String(value).toLowerCase()))];
}

function normalizeAliases(value) {
	return Array.isArray(value) ? value : [];
}

function manifestFor(file) {
	return existingJson(file.replace(/\.awtsdb$/, '.fast-manifest.json'));
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
		bytes: stat(file)?.size || 0
	};
}

function shardFiles($i) {
	const root = ragRoot($i);
	if (!fs.existsSync(root)) return [];
	return fs.readdirSync(root)
		.filter(name => name.endsWith('.awtsdb'))
		.map(name => path.join(root, name))
		.filter(file => isPublishable(manifestFor(file)));
}

module.exports = {
	aliases,
	describeFile,
	isPublishable,
	shardFiles,
	slug
};
