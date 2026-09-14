//B"H
//Boruch Hashem
//Blessed be He
/**
 * @module ProjectDatabaseDocuments
 * @description
 * Reads bounded, pageable collection previews without materializing a whole project
 * subtree. Count and aggregate-byte ceilings stop work before response growth.
 */

const DEFAULT_DOCUMENT_LIMIT = 50;
const MAX_DOCUMENT_LIMIT = 100;
const MAX_DOCUMENT_OFFSET = 10000000;
const MAX_RESPONSE_BYTES = 1048576;

/**
 * Reads one bounded page sequentially so values stop materializing at the byte ceiling.
 * @param {object} scope ProjectDatabaseScope instance.
 * @param {{path?:string,limit?:unknown,offset?:unknown}} options Preview request.
 * @returns {Promise<object>} Bounded document page with continuation testimony.
 */
async function listProjectDocuments(scope, options = {}) {
	const limit = documentLimit(options.limit);
	const offset = documentOffset(options.offset);
	const page = typeof scope.listBounded === 'function'
		? await scope.listBounded(options.path || '', limit, offset)
		: await compatibilityPage(scope, options.path || '', limit, offset);
	const documents = [];
	let responseBytes = 0;
	for (const key of page.keys) {
		const value = await scope.getKey(options.path || '', key);
		const document = { key, value };
		const bytes = Buffer.byteLength(JSON.stringify(document), 'utf8');
		if (responseBytes + bytes > MAX_RESPONSE_BYTES) break;
		responseBytes += bytes;
		documents.push(document);
	}
	const stoppedForBytes = documents.length < page.keys.length;
	const nextOffset = stoppedForBytes ? offset + documents.length : page.nextOffset;
	return {
		documents,
		returned: documents.length,
		total: page.total,
		offset,
		nextOffset,
		previousOffset: page.previousOffset,
		truncated: offset > 0 || nextOffset !== null,
		storageBounded: page.storageBounded === true,
		responseBytes,
		limit
	};
}

/** @param {object} scope DB scope. @param {string} path Path. @param {number} limit Bound. @param {number} offset Start. */
async function compatibilityPage(scope, path, limit, offset) {
	const value = await scope.list(path);
	const keys = Array.isArray(value) ? value : Object.keys(value || {});
	const selected = keys.slice(offset, offset + limit);
	return {
		keys: selected,
		total: keys.length,
		nextOffset: offset + selected.length < keys.length ? offset + selected.length : null,
		previousOffset: offset > 0 ? Math.max(0, offset - limit) : null,
		storageBounded: false
	};
}

/** @param {unknown} value Requested limit. @returns {number} Safe document count. */
function documentLimit(value) {
	const number = Number(value || DEFAULT_DOCUMENT_LIMIT);
	return !Number.isFinite(number) || number < 1 ? DEFAULT_DOCUMENT_LIMIT : Math.min(MAX_DOCUMENT_LIMIT, Math.floor(number));
}

/** @param {unknown} value Requested offset. @returns {number} Safe document offset. */
function documentOffset(value) {
	const number = Number(value || 0);
	return !Number.isFinite(number) || number < 0 ? 0 : Math.min(MAX_DOCUMENT_OFFSET, Math.floor(number));
}

module.exports = { DEFAULT_DOCUMENT_LIMIT, MAX_DOCUMENT_LIMIT, MAX_RESPONSE_BYTES, documentLimit, documentOffset, listProjectDocuments };
