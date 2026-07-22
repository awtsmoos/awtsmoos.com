// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VirtualSeriesPosts
 * @description
 * Membership is read from a canonical series; content is read from the one
 * canonical full-post collection. Their reunion reveals a post without copying
 * ownership, commentary, or hierarchy into the virtual window.
 */

const {
	sp
} = require("../_awtsmoos.constants.js");

const seriesPostsPath = (heichelId, seriesId) => (
	`${sp}/heichelos/${heichelId}/series/${seriesId}/posts`
);
const fullPostsPath = heichelId => (
	`${sp}/heichelos/${heichelId}/posts/full`
);

async function keysSafe($i, logicalPath) {
	try {
		const keys = await $i.db.getObjectKeys(logicalPath);
		return Array.isArray(keys) ? keys : [];
	} catch {
		return [];
	}
}

function decoratePost(postId, post, actualSeriesId, virtualSeriesId) {
	return {
		...post,
		id: post.id || postId,
		actualSeriesId,
		sourceSeriesId: actualSeriesId,
		virtualSeriesId,
		parentSeriesId: post.parentSeriesId || actualSeriesId
	};
}

async function readFullPost($i, heichelId, postId, properties) {
	try {
		return await $i.db.getValue(
			fullPostsPath(heichelId),
			postId,
			properties
		);
	} catch {
		return null;
	}
}

async function readCanonicalPosts({
	$i,
	heichelId,
	seriesId,
	withDetails,
	properties
}) {
	const postIds = await keysSafe($i, seriesPostsPath(heichelId, seriesId));
	if (!withDetails) {
		return postIds.map(postId => ({ postId, actualSeriesId: seriesId }));
	}
	const posts = await Promise.all(postIds.map(async postId => {
		const post = await readFullPost($i, heichelId, postId, properties);
		return post ? decoratePost(postId, post, seriesId, null) : null;
	}));
	return posts.filter(Boolean);
}

async function readCanonicalPost({
	$i,
	heichelId,
	seriesId,
	postId,
	properties
}) {
	const postIds = await keysSafe($i, seriesPostsPath(heichelId, seriesId));
	if (!postIds.includes(postId)) return null;
	const post = await readFullPost($i, heichelId, postId, properties);
	return post ? decoratePost(postId, post, seriesId, null) : null;
}

module.exports = {
	decoratePost,
	readCanonicalPost,
	readCanonicalPosts
};
