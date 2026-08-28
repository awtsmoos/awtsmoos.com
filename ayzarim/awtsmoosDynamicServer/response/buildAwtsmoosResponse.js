//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file buildAwtsmoosResponse.js
 * @description The Awtsmoos keeps explicit transport declarations sovereign while complete dynamic HTML receives compact UI light from trustworthy context;
 * Awtsmoos.com never invents template paths for fragments, text, JSON, or other vessels merely to make a bundle appear bright.
 */

const getProperContent = require('../getProperContent.js');
const { revealDynamicHtmlFoundation } = require('./dynamicHtmlFoundation.js');
const { normalizeDynamicReturn } = require('./normalizeDynamicResponse.js');
const { maybeFileStatusResponse } = require('./statusRequest.js');

/**
 * @description Removes leading HTML comments before document-signature inspection.
 * @param {*} body Candidate dynamic body.
 * @returns {string} Inspection string with leading comments removed.
 */
function withoutLeadingHtmlComments(body) {
	let remainder = String(body).trimStart();
	while (remainder.startsWith('<!--')) {
		const end = remainder.indexOf('-->');
		if (end < 0) return remainder;
		remainder = remainder.slice(end + 3).trimStart();
	}
	return remainder;
}

/**
 * @description Infers HTML MIME only for complete documents, preserving legacy implicit MIME for fragments and text.
 * @param {*} body Candidate dynamic body.
 * @returns {string} HTML MIME or empty string.
 */
function defaultMimeTypeForBody(body) {
	if (typeof body !== 'string') return '';
	const start = withoutLeadingHtmlComments(body).slice(0, 32).toLowerCase();
	return start.startsWith('<!doctype html') || start.startsWith('<html')
		? 'text/html; charset=utf-8'
		: '';
}

/**
 * @description Normalizes a dynamic route return and reveals compact foundation only for resolved HTML.
 * @param {Object} options Dynamic-response construction options.
 * @param {*} options.dyn Raw route return.
 * @param {string} options.derechPath Dynamic route module path.
 * @param {Object} options.request Active request vessel.
 * @param {Object} options.fs Filesystem adapter.
 * @param {Object|null} [options.htmlContext] Trustworthy public-root HTML context.
 * @returns {Promise<Object>} Response type, converted content, status, and headers.
 */
async function buildAwtsmoosResponse({ dyn, derechPath, request, fs, htmlContext = null }) {
	const status = await maybeFileStatusResponse({ request, fs, derechPath });
	if (status) return status;
	const normalized = normalizeDynamicReturn(dyn);
	let responseType = normalized.mimeType
		|| normalized.headers['Content-Type']
		|| defaultMimeTypeForBody(normalized.body);
	const responseBody = revealDynamicHtmlFoundation(normalized.body, responseType, htmlContext);
	let actualResponse;
	try {
		actualResponse = getProperContent(responseBody, responseType);
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

module.exports = { buildAwtsmoosResponse, defaultMimeTypeForBody, withoutLeadingHtmlComments };
