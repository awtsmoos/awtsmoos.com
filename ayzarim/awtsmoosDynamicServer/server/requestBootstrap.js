//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file requestBootstrap.js
 * @description
 * The Awtsmoos begins every request with a boundary both gentle and clear;
 * Awtsmoos.com rejects traversal before another route or filesystem can appear.
 */

const { applyCors, handleOptions } = require('./cors.js');
const { applyBaseHeaders } = require('./baseHeaders.js');
const { fullRequestUrl, inspectRequestPath } = require('./requestUrl.js');
const { parseGetParams } = require('./getParams.js');
const { guardResponseEnd } = require('./responseGuard.js');

function rejectUnsafePath(request, response, code) {
	const body = JSON.stringify({
		BH: 'B"H',
		ok: false,
		error: {
			code,
			message: 'Request path was rejected.'
		}
	});
	response.statusCode = 400;
	response.setHeader('Cache-Control', 'no-store');
	response.setHeader('Content-Type', 'application/json; charset=utf-8');
	response.setHeader('Content-Length', String(Buffer.byteLength(body)));
	response.setHeader('X-Content-Type-Options', 'nosniff');
	response.end(request.method === 'HEAD' ? '' : body);
	return null;
}

function bootstrapRequest(options) {
	applyCors(options.request, options.response);
	const pathInspection = inspectRequestPath(options.request.url);
	if (!pathInspection.safe) {
		applyBaseHeaders(options.response);
		guardResponseEnd(options.response);
		return rejectUnsafePath(
			options.request,
			options.response,
			pathInspection.code
		);
	}
	if (handleOptions(options.request, options.response)) {
		return null;
	}
	options.response.statusCode = 200;
	options.request.cookies = options.cookies;
	const fullUrl = fullRequestUrl(options.request);
	const paramKinds = { POST: {}, PUT: {}, GET: {}, DELETE: {} };
	paramKinds.GET = parseGetParams(fullUrl);
	applyBaseHeaders(options.response);
	guardResponseEnd(options.response);
	return {
		fullUrl,
		originalPath: pathInspection.decodedPath,
		paramKinds
	};
}

module.exports = {
	bootstrapRequest,
	rejectUnsafePath
};
