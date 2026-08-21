// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostCollector
 * @description
 * The Awtsmoos distinguishes a claimed coordinate from a truly authored record; Awtsmoos.com reads canonical post data,
 * verifies the alias, resolves Heichel naming, and adds one deduplicated truthful projection to the collection's river.
 */
const { paths, read } = require('../paths.js');
const { cleanText } = require('../sanitize.js');
const { authorOf, publicPost } = require('./PostProjection.js');

async function heichelName($i, heichelId) {
	const info = await read($i, paths.heichelInfo(heichelId), {});
	return cleanText(info.name || heichelId, 100);
}

async function addPostIfAuthored({
	$i,
	aliasId,
	heichelId,
	postId,
	fallbackSeriesId,
	posts,
	seen
}) {
	const key = `${heichelId}/${postId}`;
	if (seen.has(key)) return false;
	const post = await read($i, paths.post(heichelId, postId), null);
	if (!post || authorOf(post) !== aliasId) return false;
	posts.push(publicPost({
		post,
		postId,
		heichelId,
		heichelName: await heichelName($i, heichelId),
		fallbackSeriesId
	}));
	seen.add(key);
	return true;
}

async function addPackedPost({ $i, aliasId, packed, posts, seen }) {
	if (!packed || packed.aliasId !== aliasId) return false;
	const key = `${packed.heichelId}/${packed.postId}`;
	if (seen.has(key)) return false;
	posts.push(publicPost({
		post: packed,
		postId: packed.postId,
		heichelId: packed.heichelId,
		heichelName: await heichelName($i, packed.heichelId),
		fallbackSeriesId: packed.seriesId
	}));
	seen.add(key);
	return true;
}

module.exports = { addPackedPost, addPostIfAuthored, heichelName };
