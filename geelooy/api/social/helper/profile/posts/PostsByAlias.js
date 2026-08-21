// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostsByAlias
 * @description
 * The Awtsmoos lets three historical discovery ages converge without becoming three social truths; Awtsmoos.com orchestrates
 * packed census, legacy submissions, and Heichel scans, then sorts one authored collection while keeping engagement unguessed.
 */
const { allPosts } = require('../../packed/allPostsIndex.js');
const { ownedHeichelIds, relevantHeichelIds } = require('../heichelos.js');
const {
	mergeIds,
	postIds,
	submittedPostCoordinates
} = require('./PostCoordinates.js');
const { addPackedPost, addPostIfAuthored } = require('./PostCollector.js');

function sortPosts(posts = []) {
	return posts.sort((left, right) => {
		const timeDelta = (right.createdAt || 0) - (left.createdAt || 0);
		if (timeDelta) return timeDelta;
		return String(right.postId || '').localeCompare(String(left.postId || ''));
	});
}

async function collectPacked({ $i, aliasId, limit, posts, seen }) {
	for (const packed of allPosts({ $i, aliasId, limit })) {
		await addPackedPost({ $i, aliasId, packed, posts, seen });
		if (posts.length >= limit) return true;
	}
	return false;
}

async function collectSubmitted({ $i, aliasId, limit, posts, seen }) {
	for (const coordinate of await submittedPostCoordinates($i, aliasId)) {
		await addPostIfAuthored({
			$i,
			aliasId,
			...coordinate,
			fallbackSeriesId: coordinate.seriesId,
			posts,
			seen
		});
		if (posts.length >= limit) return true;
	}
	return false;
}

async function collectHeichels({ $i, aliasId, limit, posts, seen }) {
	const heichelIds = mergeIds(
		await relevantHeichelIds($i, aliasId),
		await ownedHeichelIds($i, aliasId)
	);
	for (const heichelId of heichelIds) {
		for (const postId of await postIds($i, heichelId)) {
			await addPostIfAuthored({ $i, aliasId, heichelId, postId, posts, seen });
			if (posts.length >= limit) return true;
		}
	}
	return false;
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
