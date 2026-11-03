// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostsByAlias
 * @description
 * The Awtsmoos lets three historical discovery ages converge without summoning the whole social ocean;
 * Awtsmoos.com reads one alias through its bounded packed index, then preserves legacy submissions and Heichel fallbacks.
 *
 * B"H 2026-10-21: fallback collection runs in bounded parallel batches rather than serial per-post reads.
 * B"H 2026-11-02: packed collection now uses the alias materialization plus canonical allPosts validation instead of
 * building the global grouped all-post cache for a single profile request.
 */

const { postsByAliasIndex } = require('../../packed/postsByAliasIndex.js');
const { ownedHeichelIds, relevantHeichelIds } = require('../heichelos.js');
const {
	mergeIds,
	postIds,
	submittedPostCoordinates
} = require('./PostCoordinates.js');
const { addPackedPost, addPostIfAuthored } = require('./PostCollector.js');

const BATCH = 16;

function sortPosts(posts = []) {
	return posts.sort((left, right) => {
		const timeDelta = (right.createdAt || 0) - (left.createdAt || 0);
		if (timeDelta) return timeDelta;
		return String(right.postId || '').localeCompare(String(left.postId || ''));
	});
}

async function collectBatches({ items, limit, posts, seen, keyOf, add }) {
	for (let start = 0; start < items.length; start += BATCH) {
		const batch = [];
		const batchKeys = new Set();
		for (const item of items.slice(start, start + BATCH)) {
			const key = keyOf(item);
			if (key != null) {
				if (seen.has(key) || batchKeys.has(key)) continue;
				batchKeys.add(key);
			}
			batch.push(item);
		}
		await Promise.all(batch.map(item => add(item)));
		if (posts.length >= limit) return true;
	}
	return posts.length >= limit;
}

async function collectPacked({ $i, aliasId, limit, posts, seen }) {
	const packedList = await postsByAliasIndex({ $i, aliasId, limit });
	return collectBatches({
		items: packedList,
		limit,
		posts,
		seen,
		keyOf: packed => packed ? `${packed.heichelId}/${packed.postId}` : null,
		add: packed => addPackedPost({ $i, aliasId, packed, posts, seen })
	});
}

async function collectSubmitted({ $i, aliasId, limit, posts, seen }) {
	const coordinates = await submittedPostCoordinates($i, aliasId);
	return collectBatches({
		items: coordinates,
		limit,
		posts,
		seen,
		keyOf: coordinate => `${coordinate.heichelId}/${coordinate.postId}`,
		add: coordinate => addPostIfAuthored({
			$i,
			aliasId,
			...coordinate,
			fallbackSeriesId: coordinate.seriesId,
			posts,
			seen
		})
	});
}

async function collectHeichels({ $i, aliasId, limit, posts, seen }) {
	const heichelIds = mergeIds(
		await relevantHeichelIds($i, aliasId),
		await ownedHeichelIds($i, aliasId)
	);
	const coordinates = [];
	for (const heichelId of heichelIds) {
		for (const postId of await postIds($i, heichelId)) coordinates.push({ heichelId, postId });
	}
	return collectBatches({
		items: coordinates,
		limit,
		posts,
		seen,
		keyOf: coordinate => `${coordinate.heichelId}/${coordinate.postId}`,
		add: coordinate => addPostIfAuthored({
			$i,
			aliasId,
			heichelId: coordinate.heichelId,
			postId: coordinate.postId,
			posts,
			seen
		})
	});
}

async function postsByAlias({ $i, aliasId, limit = 240 }) {
	const posts = [];
	const seen = new Set();
	if (await collectPacked({ $i, aliasId, limit, posts, seen })) return sortPosts(posts);
	if (await collectSubmitted({ $i, aliasId, limit, posts, seen })) return sortPosts(posts);
	await collectHeichels({ $i, aliasId, limit, posts, seen });
	return sortPosts(posts);
}

module.exports = { collectHeichels, collectPacked, collectSubmitted, postsByAlias, sortPosts };
