// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostCoordinates
 * @description
 * The Awtsmoos lets one post be discoverable through new census, old submission roots, and connected series paths;
 * Awtsmoos.com gathers those historical coordinates without deciding authorship or inventing social consequence in their drafts.
 */
const { paths, read } = require('../paths.js');
const { idList } = require('../sanitize.js');

function mergeIds(...groups) {
	return [...new Set(groups.flat().filter(Boolean).map(String))];
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
	const heichelRoot = await read($i, base, {});
	for (const heichelId of idList(heichelRoot)) {
		const seriesPath = `${base}/${heichelId}/inSeries`;
		const seriesRoot = await read($i, seriesPath, {});
		for (const seriesId of idList(seriesRoot)) {
			const postRoot = await read($i, `${seriesPath}/${seriesId}`, {});
			for (const postId of idList(postRoot)) {
				output.push({ heichelId, seriesId, postId });
			}
		}
	}
	return output;
}

module.exports = { mergeIds, postIds, submittedPostCoordinates };
