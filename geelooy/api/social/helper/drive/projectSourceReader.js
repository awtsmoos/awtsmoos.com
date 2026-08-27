//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectSourceReader
 * @description
 * The Awtsmoos lets source arise from Drive, Virtual OS, or a Tunnel-mounted world without teaching providers storage;
 * Awtsmoos.com measures path, decoded bytes, uniqueness, and Base64 before one cloud receives the flow, so abundance remains a guarded glow.
 */

const MAX_FILES = 10000;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_BYTES = 32 * 1024 * 1024;
const MAX_PATH_LENGTH = 1024;
const MAX_SEGMENT_LENGTH = 255;
const MAX_ENCODED_FILE_CHARS = Math.ceil(MAX_FILE_BYTES / 3) * 4;

/** Returns the attached project source reader from trusted request context. */
function projectSourceReaderFromContext(context = {}) {
	const reader = context?.projectSourceReader;
	if (typeof reader?.snapshot !== 'function') {
		return null;
	}
	return reader;
}

/**
 * Validates and normalizes one provider-facing source snapshot.
 * @param {object} value Source-reader result.
 * @returns {{files: object[], totalBytes: number}} Bounded portable source snapshot.
 */
function normalizeProjectSourceSnapshot(value = {}) {
	const sourceFiles = Array.from(value.files || []);
	if (sourceFiles.length > MAX_FILES) {
		throw sourceError('PROJECT_SOURCE_FILE_LIMIT_EXCEEDED', 413);
	}
	const paths = new Set();
	const files = [];
	let totalBytes = 0;
	for (const sourceFile of sourceFiles) {
		const file = normalizeSourceFile(sourceFile);
		if (paths.has(file.path)) {
			throw sourceError('PROJECT_SOURCE_PATH_DUPLICATE', 400);
		}
		paths.add(file.path);
		totalBytes += file.byteLength;
		if (totalBytes > MAX_TOTAL_BYTES) {
			throw sourceError('PROJECT_SOURCE_TOTAL_BYTES_EXCEEDED', 413);
		}
		files.push({ path: file.path, contentBase64: file.contentBase64 });
	}
	return { files, totalBytes };
}

/** Normalizes one file while measuring its decoded payload. */
function normalizeSourceFile(file = {}) {
	const sourcePath = normalizeSourcePath(file.path);
	const contentBase64 = String(file.contentBase64 || '');
	const byteLength = canonicalBase64ByteLength(contentBase64);
	if (byteLength > MAX_FILE_BYTES) {
		throw sourceError('PROJECT_SOURCE_FILE_BYTES_EXCEEDED', 413);
	}
	return { path: sourcePath, contentBase64, byteLength };
}

/**
 * Measures canonical Base64 only after bounding its encoded allocation size.
 * @param {string} contentBase64 Candidate encoded source bytes.
 * @returns {number} Decoded byte length.
 */
function canonicalBase64ByteLength(contentBase64) {
	if (contentBase64.length > MAX_ENCODED_FILE_CHARS) {
		throw sourceError('PROJECT_SOURCE_FILE_BYTES_EXCEEDED', 413);
	}
	if (contentBase64.length % 4 !== 0) {
		throw sourceError('PROJECT_SOURCE_BASE64_INVALID', 400);
	}
	const bytes = Buffer.from(contentBase64, 'base64');
	if (bytes.toString('base64') !== contentBase64) {
		throw sourceError('PROJECT_SOURCE_BASE64_INVALID', 400);
	}
	return bytes.length;
}

/** Normalizes one project-relative path without alternate separators or traversal. */
function normalizeSourcePath(value) {
	const sourcePath = String(value || '').trim();
	if (!sourcePath || sourcePath.startsWith('/') || sourcePath.length > MAX_PATH_LENGTH) {
		throw sourceError('PROJECT_SOURCE_PATH_INVALID', 400);
	}
	if (sourcePath.includes('\\') || sourcePath.includes('\0')) {
		throw sourceError('PROJECT_SOURCE_PATH_INVALID', 400);
	}
	const segments = sourcePath.split('/').filter(Boolean);
	const invalidSegment = segments.some(segment => (
		segment === '.' || segment === '..' || segment.length > MAX_SEGMENT_LENGTH
	));
	if (!segments.length || invalidSegment) {
		throw sourceError('PROJECT_SOURCE_PATH_INVALID', 400);
	}
	return segments.join('/');
}

/** Creates a bounded source-reader policy error without echoing file content. */
function sourceError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = {
	MAX_FILE_BYTES,
	MAX_FILES,
	MAX_TOTAL_BYTES,
	normalizeProjectSourceSnapshot,
	projectSourceReaderFromContext
};
