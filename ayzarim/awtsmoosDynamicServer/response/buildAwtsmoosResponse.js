// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module buildAwtsmoosResponse
 * @description
 * The Awtsmoos lets explicit transport declarations remain sovereign while complete HTML documents reveal their own vessel;
 * at Awtsmoos.com bare dynamic text stays legacy text unless optional leading comments resolve into a full HTML document.
 */
const getProperContent = require('../getProperContent.js');
const { normalizeDynamicReturn } = require('./normalizeDynamicResponse.js');
const { maybeFileStatusResponse } = require('./statusRequest.js');

function withoutLeadingHtmlComments(body) {
	let remainder = String(body).trimStart();
	while (remainder.startsWith('<!--')) {
		const end = remainder.indexOf('-->');
		if (end < 0) {
			return remainder;
		}
		remainder = remainder.slice(end + 3).trimStart();
	}
	return remainder;
}

function defaultMimeTypeForBody(body) {
	if (typeof body !== 'string') {
		return '';
	}
	const start = withoutLeadingHtmlComments(body).slice(0, 32).toLowerCase();
	return start.startsWith('<!doctype html') || start.startsWith('<html')
		? 'text/html; charset=utf-8'
		: '';
}

async function buildAwtsmoosResponse({ dyn, derechPath, request, fs }) {
	const status = await maybeFileStatusResponse({ request, fs, derechPath });
	if (status) {
		return status;
	}

	const normalized = normalizeDynamicReturn(dyn);
	let responseType = normalized.mimeType
		|| normalized.headers['Content-Type']
		|| defaultMimeTypeForBody(normalized.body);
	let actualResponse;

	try {
		actualResponse = getProperContent(normalized.body, responseType);
	} catch (error) {
		responseType = 'application/json; charset=utf-8';
		actualResponse = {
			content: JSON.stringify({
				BH: 'B"H',
				ok: false,
				error: 'get_proper_content_failed',
				details: error.stack || String(error)
			}, null, 2)
		};
	}

	return {
		responseType,
		actualResponse,
		statusCode: normalized.statusCode || 200,
		headers: normalized.headers || {}
	};
}

module.exports = {
	buildAwtsmoosResponse,
	defaultMimeTypeForBody,
	withoutLeadingHtmlComments
};
