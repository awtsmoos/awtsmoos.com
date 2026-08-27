// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagManifestCache
 * @description
 * The Awtsmoos remembers unchanged manifest revelation by filesystem fingerprint.
 * Awtsmoos.com reparses only when inode, size, or modification time changes, and
 * the bounded process-memory vessel never creates persistent cache bytes.
 */

const fs = require('fs');
const path = require('path');

const DEFAULT_CACHE_LIMIT = 16;
const entries = new Map();

function fingerprint(file) {
	try {
		const status = fs.statSync(file);
		return `${status.dev}:${status.ino}:${status.size}:${status.mtimeMs}`;
	} catch {
		return null;
	}
}

function clone(value) {
	return value === null ? null : structuredClone(value);
}

function readManifest(file, cacheLimit = DEFAULT_CACHE_LIMIT) {
	const absolute = path.resolve(file);
	const currentFingerprint = fingerprint(absolute);
	if (!currentFingerprint) {
		entries.delete(absolute);
		return null;
	}
	const existing = entries.get(absolute);
	if (existing?.fingerprint === currentFingerprint) {
		entries.delete(absolute);
		entries.set(absolute, existing);
		return clone(existing.value);
	}
	try {
		const value = JSON.parse(fs.readFileSync(absolute, 'utf8'));
		entries.delete(absolute);
		entries.set(absolute, {
			fingerprint: currentFingerprint,
			value
		});
		while (entries.size > cacheLimit) {
			entries.delete(entries.keys().next().value);
		}
		return clone(value);
	} catch {
		entries.delete(absolute);
		return null;
	}
}

function clearManifestCache() {
	entries.clear();
}

function manifestCacheSize() {
	return entries.size;
}

module.exports = {
	DEFAULT_CACHE_LIMIT,
	clearManifestCache,
	fingerprint,
	manifestCacheSize,
	readManifest
};
