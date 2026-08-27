//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteSourceManifest
 * @description
 * The Awtsmoos measures every public path, cache law, and total byte boundary;
 * Awtsmoos.com rejects traversal, hidden control metadata, duplicates, and excess
 * before a canonical Drive publisher is allowed to reveal a single object.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { sourceContent, sourceError } = require('./siteSourceContent.js');

const MAX_FILES = 64;
const MAX_TOTAL_BYTES = 2 * 1024 * 1024;

function normalizeSourceManifest(rootPath, files) {
	const root = normalizeDrivePath(rootPath);
	assertFileArray(files);
	const seen = new Set();
	let totalBytes = 0;
	const normalizedFiles = files.map(file => {
		const normalized = normalizeSourceFile(root, file);
		assertUniquePath(seen, normalized.path);
		totalBytes += normalized.content.length;
		if (totalBytes > MAX_TOTAL_BYTES) {
			throw sourceError('SITE_SOURCE_TOO_LARGE');
		}
		return normalized;
	});
	return {
		rootPath: root,
		totalBytes,
		files: normalizedFiles
	};
}

function assertFileArray(files) {
	if (!Array.isArray(files)) {
		throw sourceError('SITE_SOURCE_FILES_REQUIRED');
	}
	if (files.length > MAX_FILES) {
		throw sourceError('SITE_SOURCE_TOO_MANY_FILES');
	}
}

function normalizeSourceFile(root, file) {
	if (!file || typeof file !== 'object' || Array.isArray(file)) {
		throw sourceError('SITE_SOURCE_FILE_INVALID');
	}
	const path = normalizeDrivePath(file.path);
	assertPublicSourcePath(path);
	return {
		path,
		drivePath: normalizeDrivePath(`${root}/${path}`),
		content: sourceContent(file),
		mime: file.mime,
		cachePolicy: normalizedCachePolicy(file.cachePolicy)
	};
}

function assertPublicSourcePath(path) {
	if (path === '.awtsmoos' || path.startsWith('.awtsmoos/')) {
		throw sourceError('SITE_SOURCE_CONTROL_PATH_FORBIDDEN');
	}
}

function assertUniquePath(seen, path) {
	if (seen.has(path)) {
		throw sourceError('SITE_SOURCE_DUPLICATE_PATH');
	}
	seen.add(path);
}

function normalizedCachePolicy(value) {
	if (value === undefined || value === 'mutable') {
		return 'mutable';
	}
	if (value === 'immutable') {
		return 'immutable';
	}
	throw sourceError('SITE_SOURCE_CACHE_POLICY_INVALID');
}

module.exports = {
	MAX_FILES,
	MAX_TOTAL_BYTES,
	normalizeSourceManifest
};
