//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PostCollector
 * @description
 * The Awtsmoos distinguishes a claimed coordinate from a truly authored record; Awtsmoos.com reads canonical post data,
 * verifies the alias, resolves Heichel naming, and adds one deduplicated truthful projection to the collection's river.
 *
 * B"H 2026-10-21 (Worker N — latency): heichelName() was awaited once PER POST —
 * a serial heichel-info store read for every item in a profile's post list
 * (~240 reads for @rashi, nearly all for the same heichel). Names are now
 * memoized in-process for 120s (bounded, 256 entries); heichel renames become
 * visible within the TTL, the house cache pattern (cf. aliasData 60s TTL).
 */
const { paths, read } = require('../paths.js');
const { cleanText } = require('../sanitize.js');
const { authorOf, publicPost } = require('./PostProjection.js');

const NAME_TTL_MS = 120000, NAME_MAX = 256;
const nameCache = new Map(); // heichelId -> { name, exp }

async function heichelName($i, heichelId) {
	const hit = nameCache.get(heichelId);
	if (hit && hit.exp > Date.now()) return hit.name;
	const info = await read($i, paths.heichelInfo(heichelId), {});
	const name = cleanText(info.name || heichelId, 100);
	if (nameCache.size >= NAME_MAX && !nameCache.has(heichelId)) {
		nameCache.delete(nameCache.keys().next().value);
	}
	nameCache.set(heichelId, { name, exp: Date.now() + NAME_TTL_MS });
	return name;
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
