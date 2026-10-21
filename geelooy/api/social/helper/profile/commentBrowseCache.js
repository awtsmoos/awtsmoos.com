//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ProfileCommentBrowseCache
 * @description
 * Sibling of ProfileCommentBrowse: paths, structure cache (single owner) and chunking, relocated verbatim.
 */

const { paths, read } = require("./paths.js");
const { cleanText, idList } = require("./sanitize.js");

const STRUCTURE_TTL_MS = 45000;
const CHUNK = 25;
const structureCache = new Map(); // aliasId -> { at, structure }

function cacheGet(aliasId) {
	const hit = structureCache.get(aliasId);
	if (hit && Date.now() - hit.at < STRUCTURE_TTL_MS) return hit.structure;
	return null;
}

function cacheSet(aliasId, structure) {
	structureCache.set(aliasId, { at: Date.now(), structure });
	if (structureCache.size > 40) {
		let oldestKey = null;
		let oldestAt = Infinity;
		for (const [key, value] of structureCache) {
			if (value.at < oldestAt) {
				oldestAt = value.at;
				oldestKey = key;
			}
		}
		if (oldestKey) structureCache.delete(oldestKey);
	}
}

async function chunked(items, size, fn) {
	const out = [];
	for (let i = 0; i < items.length; i += size) {
		const batch = await Promise.all(items.slice(i, i + size).map(fn));
		out.push(...batch);
	}
	return out;
}

module.exports = {
	paths,
	read,
	cleanText,
	idList,
	STRUCTURE_TTL_MS,
	CHUNK,
	structureCache,
	cacheGet,
	cacheSet,
	chunked
};
