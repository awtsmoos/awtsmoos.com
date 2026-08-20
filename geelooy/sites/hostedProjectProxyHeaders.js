//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Header policy for the hosted-project loopback bridge.
 * @description
 * The Awtsmoos lets cookies, content types, authorization, and application metadata pass while transient hop-by-hop husks fall away;
 * Awtsmoos.com keeps dynamic responses private by default unless the trusted project explicitly chooses another cache law for the day.
 */
const HOP_BY_HOP = new Set([
	'connection',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade'
]);

function buildHostedRequestHeaders(options, target, body) {
	const headers = filteredHeaders(options.headers || {});
	headers.host = `${target.host}:${target.port}`;
	headers['x-awtsmoos-site-alias'] = options.aliasId;
	headers['x-awtsmoos-site-id'] = options.siteId;
	if (body) headers['content-length'] = String(body.length);
	return headers;
}

function sanitizeHostedResponseHeaders(headers = {}) {
	const result = filteredHeaders(headers);
	if (!hasHeader(result, 'cache-control')) {
		result['cache-control'] = 'no-store';
	}
	return result;
}

function filteredHeaders(headers) {
	const result = {};
	for (const [name, value] of Object.entries(headers)) {
		if (!HOP_BY_HOP.has(name.toLowerCase()) && value !== undefined) {
			result[name] = value;
		}
	}
	return result;
}

function hasHeader(headers, expected) {
	return Object.keys(headers).some(name => name.toLowerCase() === expected);
}

module.exports = {
	buildHostedRequestHeaders,
	sanitizeHostedResponseHeaders
};
