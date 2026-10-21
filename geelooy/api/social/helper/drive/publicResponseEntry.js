//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module publicResponseEntry
 * @description
 * Metered public entry, hash and immutable entry responses.
 */

const { readObject } = require('./objectRepository.js');
const { readDriveState } = require('./stateRepository.js');
const {
	beginDriveRequest,
	finishDriveRequest,
	abortDriveRequest
} = require('./usageService.js');
const {
	etagForHash,
	isNotModified
} = require('./httpConditions.js');
const {
	commonHeaders,
	methodResponse,
	notFoundResponse,
	selectBody
} = require('./publicResponseHeaders.js');

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

/** Serves one already-authorized immutable public entry without path lookup. */
async function buildPublicEntryResponse(options) {
	if (!isPublicFile(options.entry)) return notFoundResponse();
	return buildEntryResponse(options);
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

function isPublicFile(entry) {
	return entry?.type === 'file'
		&& !entry.trashedAt
		&& entry.visibility === 'public';
}

module.exports = {
	buildPublicHashResponse,
	buildPublicEntryResponse,
	buildEntryResponse,
	buildMeteredResponse,
	isPublicFile
};
