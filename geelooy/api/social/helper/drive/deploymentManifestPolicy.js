//B"H
//Boruch Hashem
//Blessed be He

const { normalizeDrivePath } = require('./pathPolicy.js');

/**
 * @module DriveDeploymentManifestPolicy
 * @description
 * The Awtsmoos binds immutable object identity to one normalized public path;
 * Awtsmoos.com rejects private, malformed, traversal, duplicate-normalized, and
 * invalid-hash entries before persisted deployment history can become public truth.
 */

/** Normalizes deployment manifest files with an explicit maximum entry count. */
function normalizeDeploymentFiles(value, maximumFiles, deploymentError) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
	const entries = Object.entries(value);
	if (entries.length > maximumFiles) {
		throw deploymentError('DEPLOYMENT_TOO_MANY_FILES', 413);
	}
	const files = {};
	for (const [candidatePath, entry] of entries) {
		const normalized = normalizeManifestEntry(candidatePath, entry);
		if (!normalized) continue;
		if (files[normalized.path]) {
			throw deploymentError('DEPLOYMENT_DUPLICATE_PATH', 400);
		}
		files[normalized.path] = normalized.entry;
	}
	return files;
}

function normalizeManifestEntry(candidatePath, entry) {
	if (!entry || entry.type !== 'file') return null;
	if (entry.visibility && entry.visibility !== 'public') return null;
	if (!/^[a-f0-9]{64}$/.test(String(entry.objectHash || ''))) return null;
	const path = normalizeDrivePath(candidatePath);
	return {
		path,
		entry: {
			type: 'file',
			objectHash: String(entry.objectHash),
			size: safeSize(entry.size),
			mime: String(entry.mime || 'application/octet-stream'),
			visibility: 'public',
			cachePolicy: entry.cachePolicy === 'immutable' ? 'immutable' : 'mutable',
			updatedAt: entry.updatedAt || null
		}
	};
}

function safeSize(value) {
	const number = Number(value);
	return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

module.exports = {
	normalizeDeploymentFiles
};
