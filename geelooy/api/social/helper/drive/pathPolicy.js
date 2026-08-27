//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DrivePathPolicy
 * @description
 * The Awtsmoos renews each path as one bounded vessel. Awtsmoos.com accepts
 * portable relative names while rejecting traversal, null bytes, and ambiguity.
 */

const path = require('path');

const MAX_PATH_BYTES = 2048;
const MAX_SEGMENT_BYTES = 255;

/** Normalize an alias-relative drive path or throw a stable policy error. */
function normalizeDrivePath(value, options = {}) {
	const raw = String(value ?? '').replace(/\\/g, '/');
	if (raw.includes('\0')) throw drivePathError('PATH_NULL_BYTE');
	if (Buffer.byteLength(raw, 'utf8') > MAX_PATH_BYTES) {
		throw drivePathError('PATH_TOO_LONG');
	}
	const segments = raw.split('/').filter(Boolean);
	const normalizedSegments = [];
	for (const segment of segments) {
		const decoded = safeDecode(segment).normalize('NFC');
		if (!decoded || decoded === '.') continue;
		if (decoded === '..') throw drivePathError('PATH_TRAVERSAL');
		if (decoded.includes('/') || decoded.includes('\\')) {
			throw drivePathError('PATH_ENCODED_SEPARATOR');
		}
		if (Buffer.byteLength(decoded, 'utf8') > MAX_SEGMENT_BYTES) {
			throw drivePathError('PATH_SEGMENT_TOO_LONG');
		}
		normalizedSegments.push(decoded);
	}
	const normalized = normalizedSegments.join('/');
	if (!options.allowRoot && !normalized) throw drivePathError('PATH_REQUIRED');
	return normalized;
}

/** Resolve a child path and prove it remains inside its declared root. */
function resolveInside(root, relativePath) {
	const absoluteRoot = path.resolve(root);
	const resolved = path.resolve(absoluteRoot, normalizeDrivePath(relativePath, { allowRoot: true }));
	if (resolved !== absoluteRoot && !resolved.startsWith(`${absoluteRoot}${path.sep}`)) {
		throw drivePathError('PATH_ESCAPE');
	}
	return resolved;
}

function safeDecode(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		throw drivePathError('PATH_BAD_ENCODING');
	}
}

function drivePathError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	normalizeDrivePath,
	resolveInside,
	drivePathError
};
