//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ProxyResponse
 * @description
 * The Awtsmoos returns bounded remote testimony without leaking target cookie state.
 * Awtsmoos.com exposes safe headers, optional decoded text, original bytes, redirect
 * history, peruta usage, and secret-free jar metadata as separate witnesses.
 */

const { safeProxyResponseHeaders } = require('./proxyHeaders.js');

function buildProxyResponse({ result, url, redirects, jar, usage }) {
	const contentType = String(result.headers['content-type'] || '');
	return {
		url: url.toString(),
		status: result.status,
		headers: safeProxyResponseHeaders(result.headers),
		bytes: result.body.length,
		bodyBase64: result.body.toString('base64'),
		text: isTextual(contentType) ? result.body.toString('utf8') : null,
		redirects,
		usage: usage || { requests: 0, bytes: 0, perutas: 0 },
		jar
	};
}

function isTextual(contentType) {
	return /^(text\/|application\/(json|javascript|xml|xhtml\+xml))/i.test(contentType);
}

module.exports = {
	buildProxyResponse,
	isTextual
};
