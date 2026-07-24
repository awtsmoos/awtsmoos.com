//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DrivePublicResponse
 * @description
 * The Awtsmoos lets public bytes flow through stable names and immutable hashes.
 * Awtsmoos.com meters requests, transfer concurrency, validators, ranges, MIME,
 * CORS, cache policy, and only the body bytes actually returned.
 */

const { normalizeDrivePath } = require('./pathPolicy.js');
const { readDriveState } = require('./stateRepository.js');
const { readObject } = require('./objectRepository.js');
const { cacheControlFor } = require('./cachePolicy.js');
const { beginDriveRequest, finishDriveRequest, abortDriveRequest } = require('./usageService.js');
const { etagForHash, isNotModified, parseByteRange } = require('./httpConditions.js');

async function buildPublicPathResponse(options) {
	const state = await readDriveState(options.aliasId, options.$i);
	let logicalPath = normalizeDrivePath(options.path || '', { allowRoot: true });
	let entry = state.entries[logicalPath];
	if (!logicalPath || entry?.type === 'folder') {
		logicalPath = logicalPath ? `${logicalPath}/index.html` : 'index.html';
		entry = state.entries[logicalPath];
	}
	if (!isPublicFile(entry)) return notFoundResponse();
	return buildEntryResponse({ ...options, entry });
}

async function buildPublicHashResponse(options) {
	const state = await readDriveState(options.aliasId, options.$i);
	const entry = Object.values(state.entries).find(candidate => {
		return isPublicFile(candidate)
			&& candidate.objectHash === options.hash
			&& candidate.cachePolicy === 'immutable';
	});
	if (!entry) return notFoundResponse();
	return buildEntryResponse({ ...options, entry });
}

async function buildEntryResponse(options) {
	const method = String(options.method || 'GET').toUpperCase();
	if (method !== 'GET' && method !== 'HEAD') return methodResponse();
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
	const entry = options.entry;
	const etag = etagForHash(entry.objectHash);
	const headers = commonHeaders(entry, etag);
	if (isNotModified(options.headers, etag, entry.updatedAt)) {
		await finishDriveRequest(options.aliasId, leaseId, 0, options.$i);
		return { statusCode: 304, headers, response: Buffer.alloc(0) };
	}
	const fullBody = await readObject(options.aliasId, entry.objectHash, options.$i);
	const selected = selectBody(fullBody, options.headers, headers);
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

function selectBody(fullBody, requestHeaders, responseHeaders) {
	const range = parseByteRange(requestHeaders, fullBody.length);
	if (!range) return { body: fullBody, statusCode: 200 };
	responseHeaders['Content-Range'] = `bytes ${range.start}-${range.end}/${fullBody.length}`;
	return {
		body: fullBody.subarray(range.start, range.end + 1),
		statusCode: 206
	};
}

function commonHeaders(entry, etag) {
	return {
		'Content-Type': entry.mime,
		'Cache-Control': cacheControlFor(entry),
		'ETag': etag,
		'Last-Modified': new Date(entry.updatedAt).toUTCString(),
		'Accept-Ranges': 'bytes',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Expose-Headers': 'Content-Length, Content-Range, ETag, Last-Modified',
		'X-Content-Type-Options': 'nosniff',
		'Vary': 'Accept-Encoding'
	};
}

function isPublicFile(entry) {
	return entry?.type === 'file' && !entry.trashedAt && entry.visibility === 'public';
}

function notFoundResponse() {
	return {
		statusCode: 404,
		headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' },
		response: 'Not Found'
	};
}

function methodResponse() {
	return {
		statusCode: 405,
		headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
		response: 'Method Not Allowed'
	};
}

module.exports = {
	buildPublicPathResponse,
	buildPublicHashResponse
};
