// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file dynamicResponseShape.js
 * @description
 * The Awtsmoos distinguishes explicit HTTP envelopes from domain records whose
 * own fields may be named contentType, status, headers, or body.
 */

function isPlainObject(value) {
	return Boolean(value)
		&& typeof value === 'object'
		&& !Buffer.isBuffer(value)
		&& !Array.isArray(value);
}

function owns(value, key) {
	return Object.prototype.hasOwnProperty.call(value, key);
}

function hasTransportControl(value) {
	return owns(value, 'statusCode')
		|| owns(value, 'headers')
		|| owns(value, 'redirect');
}

function isWrappedDynamicResponse(value) {
	if (!isPlainObject(value)) return false;
	if (owns(value, 'response')) return true;
	if (hasTransportControl(value)) return true;
	const hasBody = owns(value, 'body');
	const hasMediaType = owns(value, 'mimeType') || owns(value, 'contentType');
	return hasBody && hasMediaType;
}

function makeDynamicResponse({
	statusCode = 200,
	headers = {},
	mimeType = '',
	response = ''
} = {}) {
	return { statusCode, headers, mimeType, response };
}

function makeJsonResponse(object, statusCode = 200) {
	return makeDynamicResponse({
		statusCode,
		mimeType: 'application/json; charset=utf-8',
		headers: { 'Cache-Control': 'no-store' },
		response: JSON.stringify(object, null, 2)
	});
}

function makeHtmlResponse(html, statusCode = 200) {
	return makeDynamicResponse({
		statusCode,
		mimeType: 'text/html; charset=utf-8',
		headers: { 'Cache-Control': 'no-store' },
		response: String(html)
	});
}

function makeRedirectResponse(to, fallbackHtml) {
	return makeDynamicResponse({
		statusCode: 302,
		mimeType: 'text/html; charset=utf-8',
		headers: {
			Location: String(to),
			'Cache-Control': 'no-store'
		},
		response: fallbackHtml || `Redirecting to ${String(to)}`
	});
}

module.exports = {
	hasTransportControl,
	isPlainObject,
	isWrappedDynamicResponse,
	makeDynamicResponse,
	makeHtmlResponse,
	makeJsonResponse,
	makeRedirectResponse,
	owns
};
