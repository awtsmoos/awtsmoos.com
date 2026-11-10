//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module publicResponseEntry
 * @description
 * Public entry, hash and immutable entry responses. Public reads take
 * no transfer lease and pass no quota gate: one serving, one single
 * accounting mutation (accountPublicDownload) replaces the old
 * begin+finish pair of locked full-state rewrites. Validators answer
 * before the object is read, so a 304 costs no object disk I/O.
 */

const { readObject } = require('./objectRepository.js');
const { readDriveState } = require('./stateRepository.js');
const { accountPublicDownload } = require('./usageService.js');
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
const { effectiveMime } = require('./contentSniff.js');

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
	return buildMeteredResponse(options, method);
}

async function buildMeteredResponse(options, method) {
	const entry = options.entry;
	const etag = etagForHash(entry.objectHash);
	if (isNotModified(options.headers, etag, entry.updatedAt)) {
		await accountPublicDownload(options.aliasId, 0, options.$i);
		return { statusCode: 304, headers: commonHeaders(entry, etag), response: Buffer.alloc(0) };
	}
	const fullBody = await readObject(options.aliasId, entry.objectHash, options.$i);
	// The bytes are the only honest witness of type: when their magic
	// disproves the stored mime, the truthful mime builds every header, so
	// 200 and 206 responses alike speak the true type under nosniff.
	const truthfulEntry = { ...entry, mime: effectiveMime(fullBody, entry.mime) };
	const headers = commonHeaders(truthfulEntry, etag);
	const selected = selectBody(fullBody, options.headers, headers);
	const responseBytes = method === 'HEAD' ? 0 : selected.body.length;
	await accountPublicDownload(options.aliasId, responseBytes, options.$i);
	headers['Content-Length'] = String(selected.body.length);
	return {
		statusCode: selected.statusCode,
		headers,
		mimeType: truthfulEntry.mime,
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
