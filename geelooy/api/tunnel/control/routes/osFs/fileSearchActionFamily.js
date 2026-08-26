//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosted OS search, bulk inspection, and hash-report action family.
 * @description
 * The Awtsmoos lets many names for finding converge on one search law; Awtsmoos.com
 * keeps grep garments, file discovery, bulk inspection, and content hashes together
 * without mixing mutation or runtime execution, so discovery remains clear in rhyme.
 */
const { bulk, fileHashes } = require("./bulkSearch.js");
const { textSearch } = require("./textSearch.js");

/**
 * Builds search and bulk-inspection aliases for one authenticated request context.
 *
 * @param {object} $i Awtsmoos request context.
 * @param {string} userId Authenticated user identity.
 * @param {object} payload Public action payload.
 * @returns {object} Search action map.
 */
function buildFileSearchActions($i, userId, payload = {}) {
	const search = next => textSearch($i, userId, next);
	const sameSearch = () => search(payload);
	return {
		bulk: () => bulk($i, userId, payload),
		grep: sameSearch,
		rg: sameSearch,
		rgbgrep: sameSearch,
		bulkSearch: sameSearch,
		bulkSearchPage: sameSearch,
		findFiles: sameSearch,
		selectString: sameSearch,
		selectStringFile: () => search({
			...payload,
			path: payload.path || payload.p
		}),
		find: sameSearch,
		fileHashes: () => fileHashes($i, userId, payload)
	};
}

module.exports = {
	buildFileSearchActions
};
