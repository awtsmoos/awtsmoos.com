//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module ProfileCommentBrowseBrowse
 * @description
 * Sibling of ProfileCommentBrowse: series, post and per-post comment browsing, relocated verbatim.
 */

const { paths, read } = require('./commentBrowseCache.js');
const { scanAliasStructure } = require('./commentBrowseScan.js');
const { flattenFileComments } = require('./commentBrowseFiles.js');

function findSeries(structure, seriesId) {
	return structure.find(s => s.seriesId === seriesId) || null;
}

async function commentSeriesByAlias({ $i, aliasId }) {
	const structure = await scanAliasStructure($i, aliasId);
	return structure.map(({ posts, ...rest }) => rest);
}

async function commentPostsByAlias({ $i, aliasId, seriesId }) {
	const structure = await scanAliasStructure($i, aliasId);
	const series = findSeries(structure, seriesId);
	if (!series) return [];
	return series.posts.map(post => ({
		heichelId: series.heichelId,
		heichelName: series.heichelName,
		seriesId: series.seriesId,
		seriesTitle: series.title,
		postId: post.postId,
		postTitle: post.postTitle,
		postUrl: `/heichelos/${series.heichelId}/series/${series.seriesId}/post/${post.postId}`,
		commentCount: post.commentCount,
		latestAt: post.latestAt
	}));
}

async function commentsByAliasPost({ $i, aliasId, seriesId, postId, limit = 100, offset = 0 }) {
	const structure = await scanAliasStructure($i, aliasId);
	const series = findSeries(structure, seriesId);
	const safeLimit = Math.max(1, Math.min(500, Number(limit) || 100));
	const safeOffset = Math.max(0, Number(offset) || 0);
	if (!series) return { total: 0, limit: safeLimit, offset: safeOffset, items: [] };
	const file = await read($i, paths.commentAliasPost(series.heichelId, seriesId, postId, aliasId), {});
	const post = series.posts.find(p => p.postId === postId);
	const items = flattenFileComments({
		file,
		aliasId,
		heichelId: series.heichelId,
		heichelName: series.heichelName,
		seriesId,
		seriesTitle: series.title,
		postId,
		postTitle: (post && post.postTitle) || postId
	}).sort((a, b) => {
		const sectionDiff = Number(a.verseSection) - Number(b.verseSection);
		if (sectionDiff) return sectionDiff;
		return String(a.segmentId).localeCompare(String(b.segmentId));
	});
	return { total: items.length, limit: safeLimit, offset: safeOffset, items: items.slice(safeOffset, safeOffset + safeLimit) };
}

module.exports = {
	findSeries,
	commentSeriesByAlias,
	commentPostsByAlias,
	commentsByAliasPost
};
