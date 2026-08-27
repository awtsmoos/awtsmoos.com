//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SiteSourceContent
 * @description
 * The Awtsmoos receives either revealed text or encoded binary through one bounded
 * doorway. Awtsmoos.com keeps byte decoding separate from path and publication law,
 * so malformed content is rejected before Drive mutation can begin.
 */

function sourceContent(file) {
	const hasText = Object.prototype.hasOwnProperty.call(file, 'content');
	const hasBase64 = Object.prototype.hasOwnProperty.call(file, 'contentBase64');
	if (hasText === hasBase64) {
		throw sourceError('SITE_SOURCE_CONTENT_REQUIRED');
	}
	if (hasText) {
		return textContent(file.content);
	}
	return base64Content(file.contentBase64);
}

function textContent(value) {
	if (typeof value !== 'string') {
		throw sourceError('SITE_SOURCE_TEXT_INVALID');
	}
	return Buffer.from(value, 'utf8');
}

function base64Content(value) {
	if (typeof value !== 'string' || value.length % 4) {
		throw sourceError('SITE_SOURCE_BASE64_INVALID');
	}
	if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value)) {
		throw sourceError('SITE_SOURCE_BASE64_INVALID');
	}
	return Buffer.from(value, 'base64');
}

function sourceError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = {
	sourceContent,
	sourceError
};
