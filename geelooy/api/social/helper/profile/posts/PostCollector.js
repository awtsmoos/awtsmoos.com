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
const { findKeyReverseAsync } = require('../../packed/socialPackedKeyFind.js');
const { logicalKey } = require('../../packed/shardPaths.js');
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

async function canonicalPost($i, heichelId, postId) {
	try {
		const envelope = await findKeyReverseAsync({
			$i,
			shard: 'allPosts',
			key: logicalKey(['allPosts', heichelId, postId])
		});
		if (!envelope || envelope.op === 'del') return null;
		return envelope.value || null;
	} catch (_) {
		return null;
	}
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
	// Batch 23: the canonical packed record is the same truth the
	// packed collector trusts — consult it before paying a full
	// legacy post read per coordinate (0.43ms vs a full record).
	// Absent a canonical record, the legacy read below decides, as
	// it always has.
	const canonical = await canonicalPost($i, heichelId, postId);
	if (canonical) {
		if (authorOf(canonical) !== aliasId) return false;
		posts.push(publicPost({
			post: canonical,
			postId,
			heichelId,
			heichelName: await heichelName($i, heichelId),
			fallbackSeriesId
		}));
		seen.add(key);
		return true;
	}
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
