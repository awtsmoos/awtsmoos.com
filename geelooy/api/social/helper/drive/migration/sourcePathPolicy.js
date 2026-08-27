//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module MigrationSourcePathPolicy
 * @description
 * The Awtsmoos gives every source name a bounded vessel and a truthful place;
 * Awtsmoos.com rejects hidden separators, traversal, and every root-escaping face.
 */

const path = require('node:path');

const ENCODED_SEPARATOR = /%(?:2f|5c)/i;
const WINDOWS_DRIVE = /^[a-zA-Z]:[\\/]/;

function normalizeSourceRelativePath(value, options = {}) {
	const raw = String(value ?? '');
	if (raw.includes('\0')) throw sourcePathError('SOURCE_PATH_NULL_BYTE');
	if (ENCODED_SEPARATOR.test(raw)) {
		throw sourcePathError('SOURCE_PATH_ENCODED_SEPARATOR');
	}
	if (path.posix.isAbsolute(raw) || WINDOWS_DRIVE.test(raw) || raw.startsWith('\\\\')) {
		throw sourcePathError('SOURCE_PATH_ABSOLUTE');
	}
	const portable = raw.replace(/\\/g, '/');
	const segments = portable.split('/').filter(Boolean);
	if (!segments.length) {
		if (options.allowRoot) return '';
		throw sourcePathError('SOURCE_PATH_REQUIRED');
	}
	if (segments.some(segment => segment === '.' || segment === '..')) {
		throw sourcePathError('SOURCE_PATH_TRAVERSAL');
	}
	return segments.join('/');
}

function resolveSourcePath(sourceRoot, sourceRelativePath) {
	const root = path.resolve(String(sourceRoot || ''));
	const relative = normalizeSourceRelativePath(sourceRelativePath, { allowRoot: true });
	const resolved = path.resolve(root, ...relative.split('/').filter(Boolean));
	const prefix = `${root}${path.sep}`;
	if (resolved !== root && !resolved.startsWith(prefix)) {
		throw sourcePathError('SOURCE_PATH_ROOT_ESCAPE');
	}
	return resolved;
}

function sourcePathError(code, details = {}) {
	const error = new Error(code);
	error.code = code;
	Object.assign(error, details);
	return error;
}

module.exports = {
	normalizeSourceRelativePath,
	resolveSourcePath,
	sourcePathError
};
