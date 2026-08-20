//B"H
// Boruch Hashem
// Blessed is He

const crypto = require('crypto');
const { mimeForPath } = require('../api/social/helper/drive/mimePolicy.js');
const {
	beginDriveRequest,
	finishDriveRequest,
	abortDriveRequest
} = require('../api/social/helper/drive/usageService.js');
const { etagForHash, isNotModified } = require('../api/social/helper/drive/httpConditions.js');
const {
	commonHeaders,
	methodResponse,
	notFoundResponse,
	selectBody
} = require('../api/social/helper/drive/publicResponseHeaders.js');

/**
 * @module DirectSiteResponse
 * @description
 * The Awtsmoos lets living hosted bytes pass through the same public covenant
 * as Drive: exact hashes, ranges, cache law, HEAD semantics, and measured
 * egress. Awtsmoos.com does not invent timestamps the source does not possess.
 */

async function buildDirectSiteResponse(options = {}) {
	const method = String(options.method || 'GET').toUpperCase();
	if (!['GET', 'HEAD'].includes(method)) return methodResponse();
	if (!Buffer.isBuffer(options.body)) return notFoundResponse();
	const traffic = await beginDriveRequest(options.aliasId, {
		transfer: true,
		kind: 'public-download'
	}, options.$i);
	try {
		return await buildMeteredResponse(options, method, traffic.leaseId);
	} catch (error) {
		await abortDriveRequest(options.aliasId, traffic.leaseId, options.$i);
		throw error;
	}
}

async function buildMeteredResponse(options, method, leaseId) {
	const hash = crypto.createHash('sha256').update(options.body).digest('hex');
	const entry = directEntry(options, hash);
	const etag = etagForHash(hash);
	const headers = commonHeaders(entry, etag);
	if (isNotModified(options.headers, etag, null)) {
		await finishDriveRequest(options.aliasId, leaseId, 0, options.$i);
		return { statusCode: 304, headers, response: Buffer.alloc(0) };
	}
	const selected = selectBody(options.body, options.headers || {}, headers);
	const responseBytes = method === 'HEAD' ? 0 : selected.body.length;
	await finishDriveRequest(options.aliasId, leaseId, responseBytes, options.$i);
	headers['Content-Length'] = String(selected.body.length);
	return {
		statusCode: selected.statusCode,
		headers,
		mimeType: entry.mime,
		response: method === 'HEAD' ? Buffer.alloc(0) : selected.body
	};
}

function directEntry(options, hash) {
	return {
		path: options.path || '',
		mime: mimeForPath(options.path || ''),
		objectHash: hash,
		visibility: 'public',
		cachePolicy: 'revalidate',
		updatedAt: null
	};
}

module.exports = {
	buildDirectSiteResponse,
	directEntry
};
