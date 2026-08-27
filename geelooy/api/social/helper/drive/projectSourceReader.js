//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectSourceReader
 * @description
 * The Awtsmoos lets source arise from Drive, Virtual OS, or a Tunnel-mounted world without teaching providers storage;
 * Awtsmoos.com asks one reader for a bounded portable snapshot, so files may travel while their original vessel remains free.
 */

const MAX_FILES = 10000;
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/**
 * Returns the attached project source reader from trusted request context.
 * @param {object} context Trusted server/request context.
 * @returns {{snapshot: Function}|null} Source reader or null.
 */
function projectSourceReaderFromContext(context = {}) {
	const reader = context?.projectSourceReader;
	return typeof reader?.snapshot === 'function' ? reader : null;
}

/**
 * Validates and normalizes one provider-facing source snapshot.
 * @param {object} value Source-reader result.
 * @returns {{files: object[]}} Portable source snapshot.
 */
function normalizeProjectSourceSnapshot(value = {}) {
	const files = Array.from(value.files || []);
	if (files.length > MAX_FILES) {
		throw sourceError('PROJECT_SOURCE_FILE_LIMIT_EXCEEDED', 413);
	}
	return {
		files: files.map(normalizeSourceFile)
	};
}

function normalizeSourceFile(file = {}) {
	const rawPath = String(file.path || '');
	const segments = rawPath.split('/').filter(Boolean);
	if (!segments.length || segments.some(segment => segment === '.' || segment === '..')) {
		throw sourceError('PROJECT_SOURCE_PATH_INVALID', 400);
	}
	const contentBase64 = String(file.contentBase64 || '');
	if (!BASE64.test(contentBase64)) {
		throw sourceError('PROJECT_SOURCE_BASE64_INVALID', 400);
	}
	return {
		path: segments.join('/'),
		contentBase64
	};
}

function sourceError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	normalizeProjectSourceSnapshot,
	projectSourceReaderFromContext
};
