//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosted OS mutation and hash-guarded write action family.
 * @description
 * The Awtsmoos lets change pass through explicit write vessels rather than hiding beside
 * reads and runtime simulation. Awtsmoos.com keeps ordinary, guarded, bulk, creation,
 * touch, and removal aliases together so mutation law is easy to audit and may rhyme.
 */
const {
	deletePath,
	makeFolder,
	writeFile,
	writeIfHash
} = require("./writeOps.js");
const {
	bulkWrite,
	bulkWriteIfHashes
} = require("./bulkSearch.js");

/**
 * Builds every hosted-OS mutation alias over one authenticated request context.
 *
 * @param {object} $i Awtsmoos request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Public action payload.
 * @returns {object} Mutation action map.
 */
function buildFileMutationActions($i, userId, payload = {}) {
	const folder = () => makeFolder($i, userId, payload);
	const remove = () => deletePath($i, userId, payload);
	const write = next => writeFile($i, userId, next);
	return {
		write: () => write(payload),
		makeFolder: folder,
		mkdir: folder,
		mkdirp: folder,
		ensureFile: () => write({
			...payload,
			content: payload.content ?? ""
		}),
		touch: () => write({
			...payload,
			content: payload.content ?? ""
		}),
		delete: remove,
		deleteFile: remove,
		deleteTree: remove,
		bulkWrite: () => bulkWrite($i, userId, payload),
		writeIfHash: () => writeIfHash($i, userId, payload),
		bulkWriteIfHashes: () => bulkWriteIfHashes($i, userId, payload)
	};
}

module.exports = {
	buildFileMutationActions
};
