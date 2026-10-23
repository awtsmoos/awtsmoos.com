//B"H
//Blessed is He
//Boruch Hashem
/**
 * @module PostCoordinates
 * @description
 * The Awtsmoos lets one post be discoverable through new census, old submission roots, and connected series paths;
 * Awtsmoos.com gathers those historical coordinates without deciding authorship or inventing social consequence in their drafts.
 *
 * B"H 2026-10-20 (flap-fix): the alias submission tree mixes two storage
 * shapes — object records in the packed shards AND real directories left by
 * the old on-disk layout (e.g. .../inSeries/torasChaim-בראשית1 is a real
 * directory). Reading a directory node with the value getter ($i.db.get)
 * attempts a file open and throws/prints EISDIR. Every listing level below
 * therefore goes through readListing(), which uses the directory-aware
 * key listing ($i.db.getObjectKeys) first and only falls back to the value
 * read when no listing API exists. One bad entry can never throw here.
 */
const { paths, read } = require('../paths.js');
const { idList } = require('../sanitize.js');

function mergeIds(...groups) {
	return [...new Set(groups.flat().filter(Boolean).map(String))];
}

/**
 * Lists the child ids stored under one submission-tree node.
 * Directory nodes are listed, never opened as files (no EISDIR);
 * object-record nodes report their keys; anything unreadable yields [].
 * @param {object} $i - request context carrying the DosDB handle.
 * @param {string} yesodPath - virtual path of the node to list.
 * @returns {Promise<string[]>} child ids under the node.
 */
async function readListing($i, yesodPath) {
	try {
		if ($i && $i.db && typeof $i.db.getObjectKeys === 'function') {
			const keys = await $i.db.getObjectKeys(yesodPath);
			if (Array.isArray(keys)) return keys.map(String).filter(Boolean);
		}
	} catch { /* fall through to the value read below */ }
	return idList(await read($i, yesodPath, {}));
}

async function postIds($i, heichelId) {
	const indexed = idList(await read($i, paths.heichelPostIds(heichelId), {}));
	const legacy = idList(await read($i, paths.heichelPosts(heichelId), {}));
	const seriesIds = idList(await read($i, paths.seriesRoot(heichelId), {}));
	const seriesPosts = [];
	for (const seriesId of seriesIds) {
		seriesPosts.push(...idList(await read(
			$i,
			paths.seriesPosts(heichelId, seriesId),
			{}
		)));
	}
	return mergeIds(indexed, legacy, seriesPosts);
}

async function submittedPostCoordinates($i, aliasId) {
	const output = [];
	const base = `/social/aliases/${aliasId}/postsSubmitted/inHeichel`;
	const heichelIds = await readListing($i, base);
	for (const heichelId of heichelIds) {
		const seriesPath = `${base}/${heichelId}/inSeries`;
		const seriesIds = await readListing($i, seriesPath);
		for (const seriesId of seriesIds) {
			const postIdsAtSeries = await readListing($i, `${seriesPath}/${seriesId}`);
			for (const postId of postIdsAtSeries) {
				output.push({ heichelId, seriesId, postId });
			}
		}
	}
	return output;
}

module.exports = { mergeIds, postIds, readListing, submittedPostCoordinates };
